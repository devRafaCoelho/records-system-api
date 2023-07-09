import { Request, Response, NextFunction } from 'express';
import Joi, { ValidationError } from 'joi';

const validateRequest =
  (schema: Joi.ObjectSchema<any>) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.validateAsync(req.body);
      next();
    } catch (error: unknown) {
      const joiError = error as ValidationError;

      const errorsMap: { [key: string]: string } = joiError.details.reduce(
        (previousValue, currentValue) => {
          if (currentValue.context) {
            return {
              ...previousValue,
              [currentValue.context!.key as string]: currentValue.message
            };
          } else {
            return previousValue;
          }
        },
        {}
      );

      return res.status(400).json({ error: errorsMap });
    }
  };

export { validateRequest };
