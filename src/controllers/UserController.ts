import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { transporter } from '../config/nodemailer';
import { Login, NewPassword, RegisterUser, UpdateUser } from '../types/UserTypes';
import { compilerHtml } from '../utils/compilerHtml';

const prisma = new PrismaClient();

export const registerUser = async (req: Request, res: Response) => {
  const { firstName, lastName, email, cpf, phone, password }: RegisterUser = req.body;

  try {
    const emailExists = await prisma.user.findUnique({ where: { email } });
    if (emailExists)
      return res.status(400).json({ error: { type: 'email', message: 'E-mail já cadastrado.' } });

    if (cpf) {
      const cpfExists = await prisma.user.findFirst({ where: { cpf } });
      if (cpfExists)
        return res.status(400).json({ error: { type: 'cpf', message: 'CPF já cadastrado.' } });
    }

    const encryptedPassword = await bcrypt.hash(password, 10);

    const data = {
      firstName,
      lastName,
      email,
      cpf: cpf || null,
      phone: phone || null,
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
    if (!user)
      return res.status(400).json({ error: { type: 'email', message: 'E-mail inválido.' } });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(400).json({ error: { type: 'password', message: 'Senha inválida.' } });

    const token = jwt.sign({ id: user.id }, '123456', {
      expiresIn: '8h'
    });

    const { password: _, ...userData } = user;

    return res.status(201).json({ user: userData, token });
  } catch {
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    return res.status(200).json(req.user);
  } catch {
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const { firstName, lastName, email, cpf, phone, password }: UpdateUser = req.body;
  const { id, email: userEmail, cpf: userCpf } = req.user;

  const encryptedPassword = await bcrypt.hash(password, 10);

  const data = {
    firstName,
    lastName,
    email,
    cpf: cpf || null,
    phone: phone || null,
    password: encryptedPassword
  };

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: id
      }
    });

    if (!user) {
      return res.status(400).json({ error: { type: 'id', message: 'Usuário não encontrado.' } });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(400).json({ error: { type: 'password', message: 'Senha inválida.' } });

    const emailExists =
      userEmail !== email ? await prisma.user.findUnique({ where: { email: email } }) : null;
    if (emailExists)
      return res.status(400).json({ error: { type: 'email', message: 'E-mail já cadastrado.' } });

    if (cpf) {
      const cpfExists =
        userCpf !== cpf ? await prisma.user.findFirst({ where: { cpf: cpf } }) : null;
      if (cpfExists)
        return res.status(400).json({ error: { type: 'cpf', message: 'CPF já cadastrado.' } });
    }

    await prisma.user.update({
      where: { id: id },
      data: data
    });

    return res.status(204).send();
  } catch {
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const newPassword = async (req: Request, res: Response) => {
  const { password, newPassword }: NewPassword = req.body;
  const { id } = req.user;

  const encryptedNewPassword = await bcrypt.hash(newPassword, 10);

  const data = {
    password: encryptedNewPassword
  };

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: id
      }
    });

    if (!user) {
      return res.status(400).json({ error: { type: 'id', message: 'Usuário não encontrado.' } });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(400).json({ error: { type: 'password', message: 'Senha inválida.' } });

    await prisma.user.update({
      where: { id: id },
      data: data
    });

    return res.status(204).send();
  } catch {
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.user;

  try {
    await prisma.user.delete({
      where: { id: id }
    });

    return res.status(204).send();
  } catch {
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};
