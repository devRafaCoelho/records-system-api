export type Record = {
  id_clients: number;
  description: string;
  due_date: Date;
  value: number;
  paid_out: boolean;
  status: string;
};

export type RecordData = {
  id: number;
  id_clients: number;
  description: string;
  due_date: Date;
  value: number;
  paid_out: boolean;
  status: string;
};

export type UpdateRecord = {
  description: string;
  due_date: Date;
  value: number;
  paid_out: boolean;
  status: string;
};
