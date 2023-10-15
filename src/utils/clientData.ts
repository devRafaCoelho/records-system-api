import { PrismaClient } from '@prisma/client';
import { formatCpf, formatDate, formatName, formatPhone, formatValue } from './format';

const prisma = new PrismaClient();

export const getClientByEmail = async (email: string) => {
  const emailExists = await prisma.client.findUnique({ where: { email } });
  return emailExists;
};

export const getClientByCPF = async (cpf: string) => {
  const cpfExists = await prisma.client.findFirst({ where: { cpf } });
  return cpfExists;
};

export const getClientById = async (id: number, order = 'asc') => {
  const client = await prisma.client.findUnique({
    where: {
      id: id
    },
    include: {
      Records: {
        select: {
          id: true,
          description: true,
          due_date: true,
          value: true,
          paid_out: true,
          status: true
        },
        orderBy: {
          id: order === 'desc' ? 'desc' : 'asc'
        }
      }
    }
  });

  return client;
};

export const getClientByEmailOrCPF = async (id: number, email: string, cpf: string) => {
  const clientData = await prisma.client.findFirst({
    where: {
      OR: [
        { email, NOT: { id } },
        { cpf, NOT: { id } }
      ]
    }
  });
  return clientData;
};

export const getClientsByStatusOrName = async (status: string, name: string, order: string) => {
  const statusFilter = typeof status === 'string' ? { equals: status } : undefined;

  const clients = await prisma.client.findMany({
    orderBy: {
      firstName: order === 'desc' ? 'desc' : 'asc'
    },
    where: status
      ? { status: statusFilter }
      : name
      ? {
          OR: [
            { firstName: { contains: String(name), mode: 'insensitive' } },
            { lastName: { contains: String(name), mode: 'insensitive' } }
          ]
        }
      : {},
    include: {
      Records: {
        select: {
          id: true,
          description: true,
          due_date: true,
          value: true,
          paid_out: true,
          status: true
        }
      }
    }
  });

  return clients;
};

export const formatRecordsClient = async (client: any, clientStatus: any) => {
  const formatedRecords = client?.Records.map((record: any) => {
    if (record.status === 'expired') clientStatus = 'defaulter';

    return {
      ...record,
      due_date: formatDate(record.due_date),
      value: formatValue(record.value)
    };
  });

  return formatedRecords;
};

export const formatClient = (client: any) => {
  const { Records, ...clientData } = client;

  const hasExpiredRecord = Records.some((record: any) => record.status === 'expired');
  let clientStatus = hasExpiredRecord ? 'defaulter' : client.status;

  const formattedClient = {
    ...clientData,
    firstName: formatName(client.firstName),
    lastName: formatName(client.lastName),
    cpf: formatCpf(client.cpf),
    phone: formatPhone(client.phone),
    status: clientStatus
  };

  return formattedClient;
};

export const formatClients = async (clients: any) => {
  const formattedClients = clients.map((client: any) => {
    const { Records, ...clientData } = client;

    const hasExpiredRecord = client.Records.some((record: any) => record.status === 'expired');
    let clientStatus = hasExpiredRecord ? 'defaulter' : client.status;

    return {
      ...clientData,
      firstName: formatName(client.firstName),
      lastName: formatName(client.lastName),
      cpf: formatCpf(client.cpf),
      phone: formatPhone(client.phone),
      status: clientStatus
    };
  });

  return formattedClients;
};
