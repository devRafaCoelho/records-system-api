import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { ClientData } from '../types/ClientTypes';
import {
  formatClient,
  formatClients,
  formatRecordsClient,
  getClientById,
  getClientsByStatusOrName
} from '../utils/clientData';

const prisma = new PrismaClient();

export const registerClient = async (req: Request, res: Response) => {
  const data: ClientData = req.body;

  try {
    data.status = 'up-to-date';

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
    const client = await getClientById(Number(id), String(order));

    let clientStatus = client?.status;

    const formattedClient = formatClient(client);
    const formatedRecords = await formatRecordsClient(client, clientStatus);

    const data = {
      ...formattedClient,
      Records: formatedRecords
    };

    return res.status(200).json(data);
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
    const clients = await getClientsByStatusOrName(
      status as string,
      name as string,
      order as string
    );

    const formattedClients = await formatClients(clients);

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

export const updateClient = async (req: Request, res: Response) => {
  const data: ClientData = req.body;
  const { id } = req.params;

  try {
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
