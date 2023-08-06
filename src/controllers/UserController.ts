import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { transporter } from '../config/nodemailer';
import { Login, RegisterUser } from '../types/UserTypes';
import { compilerHtml } from '../utils/compilerHtml';

const prisma = new PrismaClient();

export const registerUser = async (req: Request, res: Response) => {
  const { firstName, lastName, email, cpf, phone, password }: RegisterUser = req.body;

  try {
    const emailExists = await prisma.user.findUnique({ where: { email } });
    if (emailExists) return res.status(400).json({ error: { email: 'E-mail já cadastrado' } });

    const cpfExists = await prisma.user.findFirst({ where: { cpf } });
    if (cpfExists) return res.status(400).json({ error: { cpf: 'CPF já cadastrado' } });

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

    const html = await compilerHtml('./src/templates/register.html', { firstName });

    await transporter.sendMail({
      from: `${process.env.EMAIL_NAME} <${process.env.EMAIL_EMAIL}>`,
      to: `${firstName} <${email}>`,
      subject: 'Welcome!!',
      html
    });

    return res.status(201).json(userData);
  } catch {
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password }: Login = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: { email: 'E-mail inválido' } });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: { password: 'Senha inválida' } });

    const token = jwt.sign({ id: user.id }, '123456', {
      expiresIn: '1h'
    });

    const { password: _, ...userData } = user;

    return res.status(201).json({ user: userData, token });
  } catch {
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const userData = {
      id: req.user.id,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      email: req.user.email
    };

    return res.status(200).json(userData);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};
