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

export const getRecord = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const record = await prisma.record.findUnique({
      where: {
        id: parseInt(id)
      }
    });

    if (!record)
      return res.status(400).json({ error: { type: 'id', message: 'Cobrança não encontrada.' } });

    const setStatus = () => {
      if (record.paid_out) return 'Paga';
      if (new Date(record.due_date) < new Date()) return 'Vencida';
      return 'Pendente';
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
    return res.status(500).json({ message: 'Erro interno do servidor' });
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
      return res.status(400).json({ error: { type: 'id', message: 'Cobrança não encontrada.' } });

    await prisma.record.update({
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

export const deleteRecord = async (req: Request, res: Response) => {
  const { id } = req.params;

  const record = await prisma.record.findUnique({
    where: {
      id: parseInt(id)
    }
  });

  if (!record)
    return res.status(400).json({ error: { type: 'id', message: 'Cobrança não encontrada.' } });

  try {
    await prisma.record.delete({
      where: { id: parseInt(id) }
    });

    return res.status(204).send();
  } catch {
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const listRecords = async (req: Request, res: Response) => {
  const {
    order,
    status,
    name,
    date,
    page: pageQuery = '1',
    perPage: perPageQuery = '10'
  } = req.query;
  const page = Number(pageQuery);
  const perPage = Number(perPageQuery);
  const offset = (page - 1) * perPage;

  try {
    const allRecords = await prisma.record.findMany({
      orderBy: {
        id: order === 'desc' ? 'desc' : 'asc'
      },
      skip: offset,
      take: perPage
    });

    const setStatus = (record: any) => {
      if (record.paid_out) return 'Paga';
      if (new Date(record.due_date) < new Date()) return 'Vencida';
      return 'Pendente';
    };

    const clientIds = allRecords.map((record) => record.id_clients);

    const clients = await prisma.client.findMany({
      where: {
        id: {
          in: clientIds
        }
      }
    });

    let formattedRecords = allRecords.map((record) => {
      const client = clients.find((client) => client.id === record.id_clients);

      return {
        recordId: record.id,
        id_clients: record.id_clients,
        description: record.description,
        due_date: formatDate(record.due_date),
        value: formatValue(record.value),
        paid_out: record.paid_out,
        status: setStatus(record),
        clientName: `${client?.firstName} ${client?.lastName}`
      };
    });

    if (status) {
      formattedRecords = formattedRecords.filter((record) => record.status === status);

      if (formattedRecords.length === 0) {
        return res
          .status(400)
          .json({ error: { type: 'status', message: 'Nenhuma cobrança encontrada.' } });
      }
    }

    if (name) {
      if (typeof name === 'string') {
        formattedRecords = formattedRecords.filter((record) =>
          record.clientName.toLowerCase().includes(name.toLowerCase())
        );
      }

      if (formattedRecords.length === 0) {
        return res
          .status(400)
          .json({ error: { type: 'name', message: 'Nenhuma cobrança encontrada.' } });
      }
    }

    if (date) {
      formattedRecords = formattedRecords.filter((record) => record.due_date === date);

      if (formattedRecords.length === 0) {
        return res
          .status(400)
          .json({ error: { type: 'date', message: 'Nenhuma cobrança encontrada.' } });
      }
    }

    const response = {
      totalRecords: formattedRecords.length,
      totalPages: Math.ceil(formattedRecords.length / perPage),
      currentPage: page,
      records: formattedRecords
    };

    return res.status(200).json(response);
  } catch {
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};
