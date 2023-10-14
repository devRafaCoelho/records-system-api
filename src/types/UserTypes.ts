export type UserData = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  cpf?: string;
  phone?: string;
};

export type RegisterUserData = {
  firstName: string;
  lastName: string;
  email: string;
  cpf?: string;
  phone?: string;
  password: string;
  confirmPassword: string;
};

export type LoginData = {
  email: string;
  password: string;
};

export type UpdateUserData = {
  firstName: string;
  lastName: string;
  email: string;
  cpf: string;
  phone: string;
  password: string;
};

export type NewPasswordData = {
  password: string;
  newPassword: string;
  confirmNewPassword: string;
};
