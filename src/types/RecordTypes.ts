export type Record = {
  id_clients: number;
  description: string;
  due_date: Date;
  value: number;
  paid_out: boolean;
  status: string;
};

export type RecordData = {
  id_clients: number;
  description: string;
  due_date: Date;
  value: number;
  paid_out: boolean;
  status: string | null | undefined;
};

export type UpdateRecord = {
  description: string;
  due_date: Date;
  value: number;
  paid_out: boolean;
  status: string;
};
