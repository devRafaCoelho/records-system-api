import { PrismaClient } from '@prisma/client';
import { formatCpf, formatDate, formatName, formatPhone, formatValue } from './format';

const prisma = new PrismaClient();

export const getUsertByEmail = async (email: string) => {
  const emailExists = await prisma.user.findUnique({ where: { email } });
  return emailExists;
};

export const getUsertByCPF = async (cpf: string) => {
  const cpfExists = await prisma.user.findFirst({ where: { cpf } });
  return cpfExists;
};

export const getUsertByID = async (id: number) => {
  const user = await prisma.user.findFirst({ where: { id } });
  return user;
};
