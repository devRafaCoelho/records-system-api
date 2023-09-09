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

    let status = 'Em dia';
    const expiredRecord = client.Record.find(
      (record) => !record.paid_out && new Date(record.due_date) < new Date()
    );
    if (expiredRecord) {
      status = 'Inadimplente';
    }

    const formattedRecords = client.Record.map((record) => ({
      ...record,
      due_date: formatDate(record.due_date),
      value: formatValue(record.value)
    }));

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
      status,
      records: formattedRecords
    };

    res.status(200).json(data);
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
    const client = await prisma.client.findFirst({
      where: {
        OR: [
          { email: email, NOT: { id: parseInt(id) } },
          { cpf: cpf, NOT: { id: parseInt(id) } }
        ]
      }
    });

    if (client) {
      if (client.email === email) {
        return res.status(400).json({ error: { type: 'email', message: 'E-mail já cadastrado.' } });
      }

      if (client.cpf === cpf) {
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
