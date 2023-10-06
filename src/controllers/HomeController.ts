import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { listRecords } from './RecordController';
import { formatCpf, formatDate, formatName, formatValue } from '../utils/format';

const prisma = new PrismaClient();

export const home = async (req: Request, res: Response) => {
  try {
    const allRecords = await prisma.record.findMany();

    const allClients = await prisma.client.findMany({
      include: {
        Record: {
          select: {
            id: true,
            description: true,
            due_date: true,
            value: true,
            paid_out: true
          }
        }
      }
    });

    const setRecordStatus = (record: any) => {
      if (record.paid_out) return 'payed';
      if (new Date(record.due_date) < new Date()) return 'expired';
      return 'pending';
    };

    function setClientStatus(records: any) {
      const expiredRecord = records.find(
        (record: any) => !record.paid_out && new Date(record.due_date) < new Date()
      );
      return expiredRecord ? 'defaulter' : 'up-to-date';
    }

    let formattedRecords = allRecords.map((record) => {
      const client = allClients.find((client) => client.id === record.id_clients);

      return {
        recordId: record.id,
        id_clients: record.id_clients,
        description: record.description,
        due_date: formatDate(record.due_date),
        value: formatValue(record.value),
        paid_out: record.paid_out,
        status: setRecordStatus(record),
        clientName: `${formatName(client?.firstName)} ${formatName(client?.lastName)}`
      };
    });

    let formattedClients = allClients.map((client) => ({
      id: client.id,
      firstName: formatName(client.firstName),
      lastName: formatName(client.lastName),
      email: client.email,
      cpf: formatCpf(client.cpf),
      phone: client.phone,
      address: client.address,
      complement: client.complement,
      zip_code: client.zip_code,
      district: client.district,
      city: client.city,
      uf: client.uf,
      status: setClientStatus(client.Record)
    }));

    const totalValuePayed = await prisma.record.aggregate({
      _sum: {
        value: true
      },
      where: {
        paid_out: true
      }
    });

    const totalValuePending = await prisma.record.aggregate({
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

    const totalValueExpired = await prisma.record.aggregate({
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

    const payedRecords = formattedRecords.filter((record) => record.status === 'payed');
    const pendingRecords = formattedRecords.filter((record) => record.status === 'expired');
    const expiredRecords = formattedRecords.filter((record) => record.status === 'pending');

    const defaulterClients = formattedClients.filter((client) => client.status === 'defaulter');
    const upToDateClientes = formattedClients.filter((client) => client.status === 'up-to-date');

    const response = {
      totalValuePayed: formatValue(totalValuePayed._sum.value),
      totalValuePending: formatValue(totalValuePending._sum.value),
      totalValueExpired: formatValue(totalValueExpired._sum.value),
      payedRecords: { total: payedRecords.length, records: payedRecords },
      pendingRecords: { total: pendingRecords.length, records: pendingRecords },
      expiredRecords: { total: expiredRecords.length, records: expiredRecords },
      defaulterClients: { total: defaulterClients.length, clients: defaulterClients },
      upToDateClients: { total: upToDateClientes.length, clients: upToDateClientes }
    };

    return res.status(200).json(response);
  } catch {
    return res.status(500).json({ message: 'Internal server error.' });
  }
};
