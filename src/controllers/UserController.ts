import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { RegisterUser } from '../types/UserTypes';

const prisma = new PrismaClient();

export const registerUser = async (req: Request, res: Response) => {
  const { firstName, lastName, email, cpf, phone, password }: RegisterUser = req.body;

  try {
    const isUserEmail = await prisma.user.findUnique({ where: { email } });
    if (isUserEmail) return res.status(400).json({ error: { email: 'E-mail já cadastrado' } });

    const isUserCPF = await prisma.user.findFirst({ where: { cpf } });
    if (isUserCPF) return res.status(400).json({ error: { cpf: 'CPF já cadastrado' } });

    const encryptedPassword = await bcrypt.hash(password, 10);

    const data = {
      firstName,
      lastName,
      email,
      cpf: cpf === '' ? null : cpf,
      phone: phone === '' ? null : phone,
      password: encryptedPassword
    };

    const registeredUser = await prisma.user.create({ data });

    const { password: _, ...userData } = registeredUser;

    return res.status(201).json(userData);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};
