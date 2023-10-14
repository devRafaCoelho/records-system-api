import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { transporter } from '../config/nodemailer';
import {
  LoginData,
  NewPasswordData,
  RegisterUserData,
  UpdateUserData,
  UserData
} from '../types/UserTypes';
import { compilerHtml } from '../utils/compilerHtml';
import { formatCpf, formatName, formatPhone } from '../utils/format';
import { getUsertByEmail } from '../utils/userData';

const prisma = new PrismaClient();

export const registerUser = async (req: Request, res: Response) => {
  const data: RegisterUserData = req.body;

  try {
    const encryptedPassword = await bcrypt.hash(data.password, 10);

    const encryptedData = {
      ...data,
      password: encryptedPassword
    };

    const { confirmPassword, ...filterData } = encryptedData;

    const registeredUser = await prisma.user.create({ data: filterData });

    const { password: _, ...userData } = registeredUser;

    const html = await compilerHtml('./src/templates/register.html', { firstName: data.firstName });

    await transporter.sendMail({
      from: `${process.env.EMAIL_NAME} <${process.env.EMAIL_EMAIL}>`,
      to: `${data.firstName} <${data.email}>`,
      subject: 'Welcome!!',
      html
    });

    return res.status(201).json(userData);
  } catch {
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export const login = async (req: Request, res: Response) => {
  const data: LoginData = req.body;

  try {
    const user = await getUsertByEmail(data.email);

    const token = jwt.sign({ id: user?.id }, '123456', {
      expiresIn: '8h'
    });

    if (user) {
      const { password, ...userData } = user;
      return res.status(201).json({ user: userData, token });
    }
  } catch {
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export const getUser = async (req: Request, res: Response) => {
  const data: UserData = req.user;

  try {
    const userData = {
      ...data,
      firstName: formatName(req.user.firstName),
      lastName: formatName(req.user.lastName),
      cpf: formatCpf(req.user.cpf),
      phone: formatPhone(req.user.phone)
    };

    return res.status(200).json(userData);
  } catch {
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const data: UpdateUserData = req.body;
  const { id } = req.user;

  const encryptedPassword = await bcrypt.hash(data.password, 10);

  const userData = {
    ...data,
    password: encryptedPassword
  };

  try {
    await prisma.user.update({
      where: { id: id },
      data: userData
    });

    return res.status(204).send();
  } catch {
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export const newPassword = async (req: Request, res: Response) => {
  const data: NewPasswordData = req.body;
  const { id } = req.user;

  const encryptedNewPassword = await bcrypt.hash(data.newPassword, 10);

  const encryptedData = {
    password: encryptedNewPassword
  };

  try {
    await prisma.user.update({
      where: { id: id },
      data: encryptedData
    });

    return res.status(204).send();
  } catch {
    return res.status(500).json({ message: 'Internal server error.' });
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
    return res.status(500).json({ message: 'Internal server error.' });
  }
};
