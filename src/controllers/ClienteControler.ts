import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { Client } from '../types/ClientTypes';
import { formatDate, formatValue } from '../utils/format';

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
  }: Client = req.body;

  try {
    const emailExists = await prisma.client.findUnique({ where: { email } });
    if (emailExists)
      return res.status(400).json({ error: { type: 'email', message: 'E-mail já cadastrado.' } });

    const cpfExists = await prisma.client.findFirst({ where: { cpf } });
    if (cpfExists)
      return res.status(400).json({ error: { type: 'cpf', message: 'CPF já cadastrado.' } });

    const data = {
      firstName,
      lastName,
      email,
      cpf,
      phone,
      address: address || null,
      complement: complement || null,
      zip_code: zip_code || null,
      district: district || null,
      city: city || null,
      uf: uf || null
    };

    const registeredClient = await prisma.client.create({ data });

    return res.status(201).json(registeredClient);
  } catch {
    return res.status(500).json({ message: 'Erro interno do servidor' });
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
        Record: {
          select: {
            id: true,
            description: true,
            due_date: true,
            value: true,
            paid_out: true
          },
          orderBy: {
            id: order === 'desc' ? 'desc' : 'asc'
          }
        }
      }
    });

    if (!client)
      return res.status(400).json({ error: { type: 'id', message: 'Cliente não encontrado.' } });

    let clientStatus = 'Em dia';

    const formattedRecords = client.Record.map((record) => {
      const getStatus = () => {
        if (record.paid_out) return 'Paga';
        if (new Date(record.due_date) < new Date()) return 'Vencida';
        return 'Pendente';
      };

      return {
        ...record,
        due_date: formatDate(record.due_date),
        value: formatValue(record.value),
        status: getStatus()
      };
    });

    const expiredRecord = formattedRecords.find((record) => record.status === 'Vencida');
    if (expiredRecord) {
      clientStatus = 'Inadimplente';
    }

    const data = {
      id: client.id,
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      cpf: client.cpf,
      phone: client.phone,
      address: client.address,
      complement: client.complement,
      zip_code: client.zip_code,
      district: client.district,
      city: client.city,
      uf: client.uf,
      status: clientStatus,
      records: formattedRecords
    };

    return res.status(200).json(data);
  } catch {
    return res.status(500).json({ message: 'Erro interno do servidor' });
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
  }: Client = req.body;
  const { id } = req.params;

  const data = {
    firstName,
    lastName,
    email,
    cpf,
    phone,
    address: address || null,
    complement: complement || null,
    zip_code: zip_code || null,
    district: district || null,
    city: city || null,
    uf: uf || null
  };

  try {
    const client = await prisma.client.findUnique({
      where: {
        id: parseInt(id)
      }
    });

    if (!client)
      return res.status(400).json({ error: { type: 'id', message: 'Cliente não encontrado.' } });

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
        return res.status(400).json({ error: { type: 'email', message: 'E-mail já cadastrado.' } });
      }

      if (clientData.cpf === cpf) {
        return res.status(400).json({ error: { type: 'cpf', message: 'CPF já cadastrado.' } });
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
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const deleteClient = async (req: Request, res: Response) => {
  const { id } = req.params;

  const client = await prisma.client.findUnique({
    where: {
      id: parseInt(id)
    }
  });

  if (!client)
    return res.status(400).json({ error: { type: 'id', message: 'Cliente não encontrado.' } });

  try {
    await prisma.$transaction([
      prisma.record.deleteMany({ where: { id_clients: parseInt(id) } }),
      prisma.client.delete({ where: { id: parseInt(id) } })
    ]);

    return res.status(204).send();
  } catch {
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const listClients = async (req: Request, res: Response) => {
  const { order, status, name, page: pageQuery = '1', perPage: perPageQuery = '10' } = req.query;
  const page = Number(pageQuery);
  const perPage = Number(perPageQuery);
  const offset = (page - 1) * perPage;

  try {
    const allClients = await prisma.client.findMany({
      orderBy: {
        id: order === 'desc' ? 'desc' : 'asc'
      },
      skip: offset,
      take: perPage,
      include: {
        Record: {
          select: {
            id: true,
            description: true,
            due_date: true,
            value: true,
            paid_out: true
          }
        }
      }
    });

    const totalClients = await prisma.client.count();

    function setStatus(records: any) {
      const expiredRecord = records.find(
        (record: any) => !record.paid_out && new Date(record.due_date) < new Date()
      );
      return expiredRecord ? 'Inadimplente' : 'Em dia';
    }

    let formattedClients = allClients.map((client) => ({
      id: client.id,
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      cpf: client.cpf,
      phone: client.phone,
      address: client.address,
      complement: client.complement,
      zip_code: client.zip_code,
      district: client.district,
      city: client.city,
      uf: client.uf,
      status: setStatus(client.Record)
    }));

    if (status) {
      formattedClients = formattedClients.filter((client) => client.status === status);

      if (formattedClients.length === 0) {
        return res
          .status(400)
          .json({ error: { type: 'status', message: 'Nenhum Cliente encontrado.' } });
      }
    }

    if (name) {
      const lowercaseName = typeof name === 'string' ? name.toLowerCase() : name;

      formattedClients = formattedClients.filter(
        (client) =>
          client.firstName.toLowerCase() === lowercaseName ||
          client.lastName.toLowerCase() === lowercaseName
      );

      if (formattedClients.length === 0) {
        return res
          .status(400)
          .json({ error: { type: 'name', message: 'Nenhum Cliente encontrado.' } });
      }
    }

    const response = {
      totalClients,
      totalPages: Math.ceil(totalClients / perPage),
      currentPage: page,
      clients: formattedClients
    };

    return res.status(200).json(response);
  } catch {
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};
