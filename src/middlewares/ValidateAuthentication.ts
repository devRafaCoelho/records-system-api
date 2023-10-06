import { PrismaClient } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const prisma = new PrismaClient();

export const validateAuthentication = async (req: Request, res: Response, next: NextFunction) => {
  const { authorization } = req.headers;

  if (!authorization) return res.status(401).json({ message: 'Unauthorized!' });

  const token = authorization.substring(7).trim();

  try {
    const { id } = jwt.verify(token, '123456') as { id: number };

    const loggedUser = await prisma.user.findUnique({ where: { id } });
    if (!loggedUser) return res.status(401).json({ message: 'Unauthorized!' });

    const { password: _, ...userData } = loggedUser;
    req.user = userData;

    next();
  } catch {
    return res.status(500).json({ message: 'Unauthorized!' });
  }
};
