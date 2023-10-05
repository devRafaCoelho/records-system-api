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
      if (record.paid_out) return 'Paga';
      if (new Date(record.due_date) < new Date()) return 'Vencida';
      return 'Pendente';
    };

    function setClientStatus(records: any) {
      const expiredRecord = records.find(
        (record: any) => !record.paid_out && new Date(record.due_date) < new Date()
      );
      return expiredRecord ? 'Inadimplente' : 'Em dia';
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

    const payedRecords = formattedRecords.filter((record) => record.status === 'Paga');
    const pendingRecords = formattedRecords.filter((record) => record.status === 'Pendente');
    const expiredRecords = formattedRecords.filter((record) => record.status === 'Vencida');

    // const totalValuePayed = payedRecords.reduce((total, record) => total + record.value, 0);
    // const totalValuePending = pendingRecords.reduce((total, record) => total + record.value, 0);
    // const totalValueExpired = expiredRecords.reduce((total, record) => total + record.value, 0);

    const totalPayedRecords = payedRecords.length;
    const totalPendingRecords = pendingRecords.length;
    const totalExpiredRecords = expiredRecords.length;

    const defaulterClients = formattedClients.filter((client) => client.status === 'Inadimplente');
    const upToDateClientes = formattedClients.filter((client) => client.status === 'Em dia');

    const totalDefaulterClients = defaulterClients.length;
    const totalUpToDateClients = upToDateClientes.length;

    const response = {
      totalValuePayed: formatValue(totalValuePayed._sum.value),
      totalValuePending: formatValue(totalValuePending._sum.value),
      totalValueExpired: formatValue(totalValueExpired._sum.value),
      payedRecords: { total: totalPayedRecords, records: payedRecords },
      pendingRecords: { total: totalPendingRecords, records: pendingRecords },
      expiredRecords: { total: totalExpiredRecords, records: expiredRecords },
      defaulterClients: { total: totalDefaulterClients, clients: defaulterClients },
      upToDateClients: { total: totalUpToDateClients, clients: upToDateClientes }
    };

    return res.status(200).json(response);
  } catch {
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};
