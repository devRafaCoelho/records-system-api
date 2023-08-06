import { Request, Response, NextFunction } from 'express';
import Joi, { ValidationError } from 'joi';

export const ValidateRequest =
  (schema: Joi.ObjectSchema<any>) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.validateAsync(req.body);
      next();
    } catch (error: unknown) {
      const joiError = error as ValidationError;

      const errorsMap: { [key: string]: string } = Object.fromEntries(
        joiError.details.map((currentValue) => [
          (currentValue.context?.key as string) || '',
          currentValue.message
        ])
      );

      return res.status(400).json({ error: errorsMap });
    }
  };
