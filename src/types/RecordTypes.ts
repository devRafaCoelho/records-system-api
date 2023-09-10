export type Record = {
  id_clients: number;
  description: string;
  due_date: Date;
  value: number;
  paid_out: boolean;
};

export type UpdateRecord = {
  description: string;
  due_date: Date;
  value: number;
  paid_out: boolean;
};
