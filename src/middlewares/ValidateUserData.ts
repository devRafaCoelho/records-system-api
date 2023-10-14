import { NextFunction, Request, Response } from 'express';
import { LoginData, NewPasswordData, RegisterUserData, UpdateUserData } from '../types/UserTypes';
import { getUsertByCPF, getUsertByEmail, getUsertByID } from '../utils/userData';
import bcrypt from 'bcrypt';

export const validateRegisterUserData = async (req: Request, res: Response, next: NextFunction) => {
  const data: RegisterUserData = req.body;

  const emailExists = await getUsertByEmail(data.email);
  if (emailExists)
    return res
      .status(400)
      .json({ error: { type: 'email', message: 'E-mail already registered.' } });

  if (data.cpf) {
    const cpfExists = await getUsertByCPF(data.cpf);
    if (cpfExists)
      return res.status(400).json({ error: { type: 'cpf', message: 'CPF already registered.' } });
  }

  next();
};

export const validateLoginData = async (req: Request, res: Response, next: NextFunction) => {
  const data: LoginData = req.body;

  const user = await getUsertByEmail(data.email);
  if (!user)
    return res
      .status(400)
      .json({ error: { type: 'data', message: 'Invalid e-mail or password.' } });

  const validPassword = await bcrypt.compare(data.password, user.password);
  if (!validPassword)
    return res
      .status(400)
      .json({ error: { type: 'data', message: 'Invalid e-mail or password.' } });

  next();
};

export const validateUpdateUserData = async (req: Request, res: Response, next: NextFunction) => {
  const data: UpdateUserData = req.body;
  const { id, email: userEmail, cpf: userCpf } = req.user;

  const user = await getUsertByID(id);
  if (!user) return res.status(400).json({ error: { type: 'id', message: 'User not found.' } });

  const validPassword = await bcrypt.compare(data.password, user.password);
  if (!validPassword)
    return res.status(400).json({ error: { type: 'password', message: 'Invalid password.' } });

  const emailExists = userEmail !== data.email ? await getUsertByEmail(data.email) : null;
  if (emailExists)
    return res
      .status(400)
      .json({ error: { type: 'email', message: 'E-mail already registered.' } });

  if (data.cpf) {
    const cpfExists = userCpf !== data.cpf ? await getUsertByCPF(data.cpf) : null;
    if (cpfExists)
      return res.status(400).json({ error: { type: 'cpf', message: 'CPF already registered.' } });
  }

  next();
};

export const validateNewPasswordData = async (req: Request, res: Response, next: NextFunction) => {
  const data: NewPasswordData = req.body;
  const { id } = req.user;

  const user = await getUsertByID(id);
  if (!user) return res.status(400).json({ error: { type: 'id', message: 'User not found.' } });

  const validPassword = await bcrypt.compare(data.password, user.password);
  if (!validPassword)
    return res.status(400).json({ error: { type: 'password', message: 'Invalid password.' } });

  next();
};
