import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { Record, UpdateRecord } from '../types/RecordTypes';
import { formatDate, formatValue } from '../utils/format';

const prisma = new PrismaClient();

export const registerRecord = async (req: Request, res: Response) => {
  const { id_clients, description, due_date, value, paid_out }: Record = req.body;

  const dueDate = new Date(due_date);

  try {
    const client = await prisma.client.findUnique({
      where: {
        id: id_clients
      }
    });

    if (!client)
      return res.status(400).json({ error: { type: 'id', message: 'Client not found.' } });

    const data = {
      id_clients,
      description,
      due_date: dueDate,
      value,
      paid_out
    };

    const registeredRecord = await prisma.record.create({ data });

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

    const setStatus = () => {
      if (record.paid_out) return 'payed';
      if (new Date(record.due_date) < new Date()) return 'expired';
      return 'pending';
    };

    const data = {
      recordId: record.id,
      id_clients: record.id_clients,
      description: record.description,
      due_date: formatDate(record.due_date),
      value: formatValue(record.value),
      paid_out: record.paid_out,
      status: setStatus()
    };

    return res.status(200).json(data);
  } catch {
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export const updateRecord = async (req: Request, res: Response) => {
  const { description, due_date, value, paid_out }: UpdateRecord = req.body;
  const { id } = req.params;

  const dueDate = new Date(due_date);

  const data = {
    description,
    due_date: dueDate,
    value,
    paid_out
  };

  try {
    const record = await prisma.record.findUnique({
      where: {
        id: parseInt(id)
      }
    });

    if (!record)
      return res.status(400).json({ error: { type: 'id', message: 'Record not found.' } });

    await prisma.record.update({
      where: {
        id: parseInt(id)
      },
      data: data
    });

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

    return res.status(204).send();
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
    page: pageQuery = '1',
    perPage: perPageQuery = '10'
  } = req.query;
  const page = Number(pageQuery);
  const perPage = Number(perPageQuery);
  const offset = (page - 1) * perPage;

  try {
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
      where: name
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

    function setStatus(record: any) {
      if (record.paid_out) return 'payed';
      if (new Date(record.due_date) < new Date()) return 'expired';
      return 'pending';
    }

    let formattedRecords = records.map((record) => {
      const client = record.client;

      return {
        recordId: record.id,
        id_clients: client.id,
        description: record.description,
        due_date: formatDate(record.due_date),
        value: formatValue(record.value),
        paid_out: record.paid_out,
        status: setStatus(record),
        clientName: `${client.firstName} ${client.lastName}`
      };
    });

    if (status) {
      formattedRecords = formattedRecords.filter((record) => record.status === status);

      if (formattedRecords.length === 0) {
        return res.status(400).json({ error: { type: 'status', message: 'No records found.' } });
      }
    }

    const totalValuePayed = await prisma.record.aggregate({
      _sum: {
        value: true
      },
      where: {
        paid_out: true
      }
    });

    const totalValuePending = await prisma.record.aggregate({
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

    const totalValueExpired = await prisma.record.aggregate({
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

    const totalRecords = formattedRecords.length;
    const totalPages = Math.ceil(totalRecords / perPage);

    if (page > totalPages) {
      return res.status(400).json({ error: { type: 'page', message: 'No records found.' } });
    }

    const paginatedRecords = formattedRecords.slice(offset, offset + perPage);

    return res.status(200).json({
      page,
      totalPages,
      totalRecords,
      totalValuePayed: formatValue(totalValuePayed._sum.value),
      totalValuePending: formatValue(totalValuePending._sum.value),
      totalValueExpired: formatValue(totalValueExpired._sum.value),
      records: paginatedRecords
    });
  } catch {
    return res.status(500).json({ message: 'Internal server error.' });
  }
};
