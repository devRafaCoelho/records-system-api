import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { transporter } from '../config/nodemailer';
import { Login, NewPassword, RegisterUser, UpdateUser } from '../types/UserTypes';
import { compilerHtml } from '../utils/compilerHtml';
import { RegisterClient } from '../types/ClientTypes';

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
  }: RegisterClient = req.body;

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
