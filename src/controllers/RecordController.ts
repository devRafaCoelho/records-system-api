import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { RegisterRecord } from '../types/RecordTypes';
import { formatDate, formatValue } from '../utils/format';

const prisma = new PrismaClient();

export const registerRecord = async (req: Request, res: Response) => {
  const { id_clients, description, due_date, value, paid_out }: RegisterRecord = req.body;

  const dueDate = new Date(due_date);

  try {
    const data = {
      id_clients,
      description,
      due_date: dueDate,
      value,
      paid_out
    };

    const registeredRecord = await prisma.record.create({ data });

    const formattedDueDate = formatDate(registeredRecord.due_date);
    const formattedValue = formatValue(registeredRecord.value);

    const formatedResponse = {
      ...registeredRecord,
      due_date: formattedDueDate,
      value: formattedValue
    };

    return res.status(201).json(formatedResponse);
  } catch {
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};
