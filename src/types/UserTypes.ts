export type RegisterUser = {
  firstName: string;
  lastName: string;
  email: string;
  cpf?: string;
  phone?: string;
  password: string;
  confirmPassword: string;
};

export type Login = {
  email: string;
  password: string;
};

export type UpdateUser = {
  firstName: string;
  lastName: string;
  email: string;
  cpf: string;
  phone: string;
  password: string;
};

export type NewPassword = {
  password: string;
  newPassword: string;
  confirmNewPassword: string;
};
