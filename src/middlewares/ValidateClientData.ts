import { NextFunction, Request, Response } from 'express';
import { ClientData } from '../types/ClientTypes';
import {
  getClientByCPF,
  getClientByEmail,
  getClientByEmailOrCPF,
  getClientById,
  getClientsByStatusOrName
} from '../utils/clientData';

export const validateRegisterClientData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const data: ClientData = req.body;

  const emailExists = await getClientByEmail(data.email);
  if (emailExists)
    return res
      .status(400)
      .json({ error: { type: 'email', message: 'E-mail already registered.' } });

  const cpfExists = await getClientByCPF(data.cpf);
  if (cpfExists)
    return res.status(400).json({ error: { type: 'cpf', message: 'CPF already registered.' } });

  next();
};

export const validateClientData = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { order } = req.query;

  const client = await getClientById(Number(id), String(order));
  if (!client) return res.status(400).json({ error: { type: 'id', message: 'Client not found.' } });

  next();
};

export const validateUpdateClientData = async (req: Request, res: Response, next: NextFunction) => {
  const data: ClientData = req.body;
  const { id } = req.params;

  const client = await getClientById(Number(id));
  if (!client) return res.status(400).json({ error: { type: 'id', message: 'Client not found.' } });

  const clientData = await getClientByEmailOrCPF(Number(id), data.email, data.cpf);

  if (clientData) {
    if (clientData.email === data.email) {
      return res
        .status(400)
        .json({ error: { type: 'email', message: 'E-mail already registered.' } });
    }

    if (clientData.cpf === data.cpf) {
      return res.status(400).json({ error: { type: 'cpf', message: 'CPF already registered.' } });
    }
  }

  next();
};

export const validateListClientsData = async (req: Request, res: Response, next: NextFunction) => {
  const { status, name, order } = req.query;

  const clients = await getClientsByStatusOrName(status as string, name as string, order as string);

  if (clients.length === 0)
    return res.status(400).json({ error: { type: 'data', message: 'No clients found.' } });

  next();
};
