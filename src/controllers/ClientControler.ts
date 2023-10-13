import { Prisma, PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { Client, ClientData } from '../types/ClientTypes';
import { formatCpf, formatDate, formatName, formatPhone, formatValue } from '../utils/format';

const prisma = new PrismaClient();

export const registerClient = async (req: Request, res: Response) => {
  const {
    firstName,
    lastName,
    email,
    cpf,
    phone,
    address,
    complement,
    zip_code,
    district,
    city,
    uf
  }: ClientData = req.body;

  try {
    const emailExists = await prisma.client.findUnique({ where: { email } });
    if (emailExists)
      return res
        .status(400)
        .json({ error: { type: 'email', message: 'E-mail already registered.' } });

    const cpfExists = await prisma.client.findFirst({ where: { cpf } });
    if (cpfExists)
      return res.status(400).json({ error: { type: 'cpf', message: 'CPF already registered.' } });

    const data: ClientData = {
      firstName,
      lastName,
      email,
      cpf,
      phone,
      address,
      complement,
      zip_code,
      district,
      city,
      uf,
      status: 'up-to-date'
    };

    const registeredClient = await prisma.client.create({ data });

    return res.status(201).json(registeredClient);
  } catch {
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export const getClient = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { order } = req.query;

  try {
    const client = await prisma.client.findUnique({
      where: {
        id: parseInt(id)
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
          },
          orderBy: {
            id: order === 'desc' ? 'desc' : 'asc'
          }
        }
      }
    });

    if (!client)
      return res.status(400).json({ error: { type: 'id', message: 'Client not found.' } });

    let clientStatus = client.status;

    const formatedRecords = client.Records.map((record) => {
      if (record.status === 'expired') clientStatus = 'defaulter';

      return {
        ...record,
        due_date: formatDate(record.due_date),
        value: formatValue(record.value)
      };
    });

    const data = {
      ...client,
      status: clientStatus,
      Records: formatedRecords
    };

    return res.status(200).json(data);
  } catch {
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export const updateClient = async (req: Request, res: Response) => {
  const {
    firstName,
    lastName,
    email,
    cpf,
    phone,
    address,
    complement,
    zip_code,
    district,
    city,
    uf
  }: ClientData = req.body;
  const { id } = req.params;

  const data: ClientData = {
    firstName,
    lastName,
    email,
    cpf,
    phone,
    address,
    complement,
    zip_code,
    district,
    city,
    uf
  };

  try {
    const client = await prisma.client.findUnique({
      where: {
        id: parseInt(id)
      }
    });

    if (!client)
      return res.status(400).json({ error: { type: 'id', message: 'Client not found.' } });

    const clientData = await prisma.client.findFirst({
      where: {
        OR: [
          { email: email, NOT: { id: parseInt(id) } },
          { cpf: cpf, NOT: { id: parseInt(id) } }
        ]
      }
    });

    if (clientData) {
      if (clientData.email === email) {
        return res
          .status(400)
          .json({ error: { type: 'email', message: 'E-mail already registered.' } });
      }

      if (clientData.cpf === cpf) {
        return res.status(400).json({ error: { type: 'cpf', message: 'CPF already registered.' } });
      }
    }

    await prisma.client.update({
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

export const deleteClient = async (req: Request, res: Response) => {
  const { id } = req.params;

  const client = await prisma.client.findUnique({
    where: {
      id: parseInt(id)
    }
  });

  if (!client) return res.status(400).json({ error: { type: 'id', message: 'Client not found.' } });

  try {
    await prisma.$transaction([
      prisma.record.deleteMany({ where: { id_clients: parseInt(id) } }),
      prisma.client.delete({ where: { id: parseInt(id) } })
    ]);

    return res.status(204).send();
  } catch {
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export const listClients = async (req: Request, res: Response) => {
  const { order, status, name, page: pageQuery = 1, perPage: perPageQuery = 25 } = req.query;
  const page = Number(pageQuery);
  const perPage = Number(perPageQuery);
  const offset = (page - 1) * perPage;

  try {
    const statusFilter: Prisma.StringNullableFilter | undefined =
      typeof status === 'string' ? { equals: status } : undefined;

    const clients = await prisma.client.findMany({
      orderBy: {
        firstName: order === 'desc' ? 'desc' : 'asc'
      },
      where: status
        ? { status: statusFilter }
        : name
        ? {
            OR: [
              { firstName: { contains: String(name), mode: 'insensitive' } },
              { lastName: { contains: String(name), mode: 'insensitive' } }
            ]
          }
        : {},
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

    if (clients.length === 0) {
      return res.status(400).json({ error: { type: 'name', message: 'No clients found.' } });
    }

    const formattedClients = clients.map((client) => {
      const { Records, ...clientData } = client;

      const hasExpiredRecord = client.Records.some((record) => record.status === 'expired');
      let clientStatus = hasExpiredRecord ? 'defaulter' : client.status;

      return {
        ...clientData,
        firstName: formatName(client.firstName),
        lastName: formatName(client.lastName),
        cpf: formatCpf(client.cpf),
        phone: formatPhone(client.phone),
        status: clientStatus
      };
    });

    // if (status) {
    //   formattedClients = formattedClients.filter((client) => client.status === status);

    //   if (formattedClients.length === 0) {
    //     return res.status(400).json({ error: { type: 'status', message: 'No clients found.' } });
    //   }
    // }

    const paginatedClients = formattedClients.slice(offset, offset + perPage);
    const totalClients = formattedClients.length;
    const totalPages = Math.ceil(totalClients / perPage);

    if (page > totalPages) {
      return res.status(400).json({ error: { type: 'page', message: 'No clients found.' } });
    }

    return res.status(200).json({
      page,
      totalPages,
      totalClients,
      clients: paginatedClients
    });
  } catch {
    return res.status(500).json({ message: 'Internal server error.' });
  }
};
