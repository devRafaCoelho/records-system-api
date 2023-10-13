import { Prisma, PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { Record, RecordData, UpdateRecord } from '../types/RecordTypes';
import { formatDate, formatValue } from '../utils/format';

const prisma = new PrismaClient();

export const registerRecord = async (req: Request, res: Response) => {
  const { id_clients, description, due_date, value, paid_out }: RecordData = req.body;

  const dueDate = new Date(due_date);

  try {
    const client = await prisma.client.findUnique({
      where: {
        id: id_clients
      }
    });

    if (!client)
      return res.status(400).json({ error: { type: 'id', message: 'Client not found.' } });

    const status = () => {
      switch (true) {
        case paid_out:
          return 'payed';
        case new Date(dueDate) < new Date():
          return 'expired';
        default:
          return 'pending';
      }
    };

    const data: RecordData = {
      id_clients,
      description,
      due_date: dueDate,
      value,
      paid_out,
      status: status()
    };

    const registeredRecord = await prisma.record.create({ data });

    if (registeredRecord.status === 'expired') {
      await prisma.client.update({
        where: { id: id_clients },
        data: { status: 'defaulter' }
      });
    }

    const formatedResponse = {
      ...registeredRecord,
      due_date: formatDate(registeredRecord.due_date),
      value: formatValue(registeredRecord.value)
    };

    return res.status(201).json(formatedResponse);
  } catch {
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export const getRecord = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const record = await prisma.record.findUnique({
      where: {
        id: parseInt(id)
      }
    });

    if (!record)
      return res.status(400).json({ error: { type: 'id', message: 'Record not found.' } });

    const response = {
      ...record,
      due_date: formatDate(record.due_date),
      value: formatValue(record.value)
    };

    return res.status(200).json(response);
  } catch {
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export const listRecords = async (req: Request, res: Response) => {
  const {
    orderID,
    orderName,
    status,
    name,
    page: pageQuery = 1,
    perPage: perPageQuery = 25
  } = req.query;
  const page = Number(pageQuery);
  const perPage = Number(perPageQuery);
  const offset = (page - 1) * perPage;

  try {
    const statusFilter: Prisma.StringNullableFilter | undefined =
      typeof status === 'string' ? { equals: status } : undefined;

    const records = await prisma.record.findMany({
      orderBy: orderID
        ? {
            id: orderID === 'desc' ? 'desc' : 'asc'
          }
        : orderName
        ? {
            client: {
              firstName: orderName === 'desc' ? 'desc' : 'asc'
            }
          }
        : {},
      where: status
        ? { status: statusFilter }
        : name
        ? {
            client: {
              OR: [
                { firstName: { contains: String(name), mode: 'insensitive' } },
                { lastName: { contains: String(name), mode: 'insensitive' } }
              ]
            }
          }
        : {},
      include: {
        client: true
      }
    });

    let formattedRecords = records.map((record) => {
      const { client, ...recordData } = record;

      return {
        ...recordData,
        due_date: formatDate(record.due_date),
        value: formatValue(record.value),
        clientName: `${client.firstName} ${client.lastName}`
      };
    });

    let totalValue;

    if (status === 'payed') {
      totalValue = await prisma.record.aggregate({
        _sum: {
          value: true
        },
        where: {
          paid_out: true
        }
      });
    } else if (status === 'pending') {
      totalValue = await prisma.record.aggregate({
        _sum: {
          value: true
        },
        where: {
          paid_out: false,
          due_date: {
            gt: new Date()
          }
        }
      });
    } else if (status === 'expired') {
      totalValue = await prisma.record.aggregate({
        _sum: {
          value: true
        },
        where: {
          paid_out: false,
          due_date: {
            lte: new Date()
          }
        }
      });
    }

    const totalRecords = formattedRecords.length;
    const totalPages = Math.ceil(totalRecords / perPage);
    const paginatedRecords = formattedRecords.slice(offset, offset + perPage);

    if (page > totalPages) {
      return res.status(400).json({ error: { type: 'page', message: 'No records found.' } });
    }

    const response = {
      page,
      totalPages,
      totalRecords,
      totalValue: status ? formatValue(totalValue?._sum.value) : undefined,
      records: paginatedRecords
    };

    return res.status(200).json(response);
  } catch {
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export const updateRecord = async (req: Request, res: Response) => {
  const { description, due_date, value, paid_out }: UpdateRecord = req.body;
  const { id } = req.params;

  const dueDate = new Date(due_date);

  try {
    const record = await prisma.record.findUnique({
      where: {
        id: parseInt(id)
      }
    });

    if (!record)
      return res.status(400).json({ error: { type: 'id', message: 'Record not found.' } });

    const status = () => {
      switch (true) {
        case paid_out:
          return 'payed';
        case new Date(dueDate) < new Date():
          return 'expired';
        default:
          return 'pending';
      }
    };

    const data: UpdateRecord = {
      description,
      due_date: dueDate,
      value,
      paid_out,
      status: status()
    };

    const updatedRecord = await prisma.record.update({
      where: {
        id: parseInt(id)
      },
      data: data
    });

    if (updatedRecord.status === 'expired') {
      await prisma.client.update({
        where: { id: record?.id_clients },
        data: { status: 'defaulter' }
      });
    } else {
      const client = await prisma.client.findUnique({
        where: {
          id: record?.id_clients
        },
        include: {
          Records: {
            select: {
              id: true,
              description: true,
              due_date: true,
              value: true,
              paid_out: true,
              status: true
            }
          }
        }
      });

      const hasExpiredRecord = client?.Records.some((record) => record.status === 'expired');

      if (!hasExpiredRecord) {
        await prisma.client.update({
          where: { id: record?.id_clients },
          data: { status: 'up-to-date' }
        });
      }
    }

    return res.status(204).send();
  } catch {
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export const deleteRecord = async (req: Request, res: Response) => {
  const { id } = req.params;

  const record = await prisma.record.findUnique({
    where: {
      id: parseInt(id)
    }
  });

  if (!record) return res.status(400).json({ error: { type: 'id', message: 'Record not found.' } });

  try {
    await prisma.record.delete({
      where: { id: parseInt(id) }
    });

    const client = await prisma.client.findUnique({
      where: {
        id: record?.id_clients
      },
      include: {
        Records: {
          select: {
            id: true,
            description: true,
            due_date: true,
            value: true,
            paid_out: true,
            status: true
          }
        }
      }
    });

    const hasExpiredRecord = client?.Records.some((record) => record.status === 'expired');

    if (!hasExpiredRecord) {
      await prisma.client.update({
        where: { id: record?.id_clients },
        data: { status: 'up-to-date' }
      });
    }

    return res.status(204).send();
  } catch {
    return res.status(500).json({ message: 'Internal server error.' });
  }
};
