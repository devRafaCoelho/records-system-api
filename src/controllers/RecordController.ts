import { Prisma, PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { RecordData, UpdateRecord } from '../types/RecordTypes';
import { formatDate, formatValue } from '../utils/format';
import {
  calculateTotalValue,
  formatRecords,
  formatResponse,
  getClientRecordByID,
  getRecordByID,
  getRecordsByStatusOrName,
  setStatus
} from '../utils/recordData';

const prisma = new PrismaClient();

export const registerRecord = async (req: Request, res: Response) => {
  const data: RecordData = req.body;

  const dueDate = new Date(data.due_date);

  try {
    const recorData = {
      ...data,
      due_date: dueDate,
      status: setStatus(data, dueDate)
    };

    const registeredRecord = await prisma.record.create({ data: recorData });

    if (registeredRecord.status === 'expired') {
      await prisma.client.update({
        where: { id: data.id_clients },
        data: { status: 'defaulter' }
      });
    }

    const formatedResponse = formatResponse(registeredRecord);

    return res.status(201).json(formatedResponse);
  } catch {
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export const getRecord = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const record = await getRecordByID(Number(id));

    if (record) {
      const response = {
        ...record,
        due_date: formatDate(record.due_date),
        value: formatValue(record.value)
      };

      return res.status(200).json(response);
    }
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
    const records = await getRecordsByStatusOrName(
      status as string,
      name as string,
      orderID as string,
      orderName as string
    );

    const formattedRecords = formatRecords(records);

    const totalValue = await calculateTotalValue(String(status));

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
  const data: UpdateRecord = req.body;
  const { id } = req.params;

  const dueDate = new Date(data.due_date);

  try {
    const record = await getRecordByID(Number(id));

    const recordData = {
      ...data,
      due_date: dueDate,
      status: setStatus(data, dueDate)
    };

    const updatedRecord = await prisma.record.update({
      where: {
        id: parseInt(id)
      },
      data: recordData
    });

    if (updatedRecord.status === 'expired') {
      await prisma.client.update({
        where: { id: record?.id_clients },
        data: { status: 'defaulter' }
      });
    } else {
      const client = await getClientRecordByID(Number(record?.id_clients));

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

  try {
    const record = await getRecordByID(Number(id));

    await prisma.record.delete({
      where: { id: parseInt(id) }
    });

    const client = await getClientRecordByID(Number(record?.id_clients));

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
