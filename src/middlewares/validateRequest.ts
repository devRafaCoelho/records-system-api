import { Request, Response, NextFunction } from 'express';
import Joi, { ValidationError } from 'joi';

export const ValidateRequest =
  (schema: Joi.ObjectSchema<any>) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.validateAsync(req.body);
      next();
    } catch (error: unknown) {
      const joiError = error as ValidationError;

      const firstError = joiError.details[0];

      const errorObject = {
        type: (firstError?.context?.key as string) || '',
        message: firstError?.message || ''
      };

      return res.status(400).json({ error: errorObject });
    }
  };
