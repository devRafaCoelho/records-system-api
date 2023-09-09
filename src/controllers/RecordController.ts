import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { RegisterRecord } from '../types/RecordTypes';
import { formatDate, formatValue } from '../utils/format';

const prisma = new PrismaClient();

export const registerRecord = async (req: Request, res: Response) => {
  const { id_clients, description, due_date, value, paid_out }: RegisterRecord = req.body;

  const dueDate = new Date(due_date);

  try {
    const client = await prisma.client.findUnique({
      where: {
        id: id_clients
      }
    });

    if (!client)
      return res.status(400).json({ error: { type: 'id', message: 'Cliente não encontrado.' } });

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
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};
