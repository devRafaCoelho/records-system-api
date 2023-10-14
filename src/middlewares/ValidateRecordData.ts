import { NextFunction, Request, Response } from 'express';
import { RecordData } from '../types/RecordTypes';
import { getClientRecordByID, getRecordByID, getRecordsByStatusOrName } from '../utils/recordData';

export const validateRegisterRecordData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const data: RecordData = req.body;

  const client = await getClientRecordByID(data.id_clients);

  if (!client) return res.status(400).json({ error: { type: 'id', message: 'Client not found.' } });

  next();
};

export const validateRecordData = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  const record = await getRecordByID(Number(id));
  if (!record) return res.status(400).json({ error: { type: 'id', message: 'Record not found.' } });

  next();
};

export const validateListRecordsData = async (req: Request, res: Response, next: NextFunction) => {
  const { status, name, orderID, orderName } = req.query;

  const records = await getRecordsByStatusOrName(
    status as string,
    name as string,
    orderID as string,
    orderName as string
  );

  if (records.length === 0)
    return res.status(400).json({ error: { type: 'data', message: 'No records found.' } });

  next();
};
