import { PrismaClient } from '@prisma/client';
import { formatCpf, formatDate, formatName, formatPhone, formatValue } from './format';

const prisma = new PrismaClient();

export const getClientRecordByID = async (id: number) => {
  const client = await prisma.client.findUnique({
    where: { id },
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

  return client;
};

export const getRecordByID = async (id: number) => {
  const record = await prisma.record.findUnique({ where: { id } });
  return record;
};

export const getRecordsByStatusOrName = async (
  status: string,
  name: string,
  orderID: string,
  orderName: string
) => {
  const statusFilter = typeof status === 'string' ? { equals: status } : undefined;

  const records = await prisma.record.findMany({
    orderBy: orderID
      ? {
          id: orderID === 'desc' ? 'desc' : 'asc'
        }
      : orderName
      ? {
          client: {
            firstName: orderName === 'desc' ? 'desc' : 'asc'
          }
        }
      : {},
    where: status
      ? { status: statusFilter }
      : name
      ? {
          client: {
            OR: [
              { firstName: { contains: String(name), mode: 'insensitive' } },
              { lastName: { contains: String(name), mode: 'insensitive' } }
            ]
          }
        }
      : {},
    include: {
      client: true
    }
  });

  return records;
};

export const formatRecords = (records: any) => {
  const formattedRecords = records.map((record: any) => {
    const { client, ...recordData } = record;

    return {
      ...recordData,
      due_date: formatDate(record.due_date),
      value: formatValue(record.value),
      clientName: `${client.firstName} ${client.lastName}`
    };
  });

  return formattedRecords;
};

export const calculateTotalValue = async (status: string) => {
  let totalValue;
  if (status === 'payed') {
    totalValue = await prisma.record.aggregate({
      _sum: {
        value: true
      },
      where: {
        paid_out: true
      }
    });
  } else if (status === 'pending') {
    totalValue = await prisma.record.aggregate({
      _sum: {
        value: true
      },
      where: {
        paid_out: false,
        due_date: {
          gt: new Date()
        }
      }
    });
  } else if (status === 'expired') {
    totalValue = await prisma.record.aggregate({
      _sum: {
        value: true
      },
      where: {
        paid_out: false,
        due_date: {
          lte: new Date()
        }
      }
    });
  }

  return totalValue;
};

export const setStatus = (data: any, dueDate: any) => {
  if (data.paid_out) {
    return 'payed';
  }
  if (new Date(dueDate) < new Date()) {
    return 'expired';
  }
  return 'pending';
};

export const formatResponse = (record: any) => {
  return {
    ...record,
    due_date: formatDate(record.due_date),
    value: formatValue(record.value)
  };
};
