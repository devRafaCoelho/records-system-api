import Joi from 'joi';
import JoiDate from '@joi/date';

const JoiExtended = Joi.extend(JoiDate);

export const RegisterRecordSchema = Joi.object({
  id_clients: Joi.number().required().messages({
    'any.required': 'The client ID is required.',
    'string.empty': 'The client ID is required.',
    'number.empty': 'The client ID is required.'
  }),
  description: Joi.string().max(100).required().messages({
    'string.max': 'The description must contain a maximum of 500 characters.',
    'any.required': 'The description is required.',
    'string.empty': 'The description is required.'
  }),
  due_date: JoiExtended.date().format('DD-MM-YYYY').required().messages({
    'date.format': 'Invalid date',
    'any.required': 'The expiration date is required.',
    'number.empty': 'The expiration date is required.',
    'number.base': 'The date value must be a number.'
  }),
  value: Joi.number().required().messages({
    'any.required': 'The record amount is required.',
    'number.base': 'The record amount must be a number.'
  }),
  paid_out: Joi.boolean().required().messages({
    'any.required': 'The payment status is required.',
    'boolean.empty': 'The payment status is required.'
  })
});
