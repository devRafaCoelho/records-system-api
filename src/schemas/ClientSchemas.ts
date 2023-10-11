import Joi from 'joi';
import { cpf } from 'cpf-cnpj-validator';
import { isValidNumber, CountryCode } from 'libphonenumber-js';

export const RegisterClientSchema = Joi.object({
  firstName: Joi.string().required().messages({
    'any.required': 'The first name is required.',
    'string.empty': 'The first name is required.',
    'string.base': 'The first name must be a valid name.'
  }),
  lastName: Joi.string().required().messages({
    'any.required': 'The last name is required.',
    'string.empty': 'The last name is required.',
    'string.base': 'The last name must be a valid name.'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'The e-mail must be valid.',
    'any.required': 'The e-mail is required.',
    'string.empty': 'The e-mail is required.'
  }),
  cpf: Joi.string()
    .custom((value: string, helpers: any) => {
      if (!cpf.isValid(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    })
    .regex(/^\d{11}$/)
    .trim()
    .required()
    .messages({
      'any.required': 'The CPF is required.',
      'string.empty': 'The CPF is required.',
      'any.invalid': 'Invalid CPF.',
      'string.pattern.base': 'Invalid CPF.',
      'string.length': 'Invalid CPF.'
    }),
  phone: Joi.string()
    .custom((value: string, helpers: any) => {
      if (!isValidNumber(value, 'BR' as CountryCode)) {
        return helpers.error('any.invalid');
      }
      return value;
    })
    .regex(/^\+55\d{11}$/)
    .trim()
    .required()
    .messages({
      'any.required': 'The phone number is required.',
      'string.empty': 'The phone number is required.',
      'any.invalid': 'Invalid phone number.',
      'string.pattern.base': 'Invalid phone number.',
      'string.length': 'Invalid phone number.'
    }),
  address: Joi.string().trim().allow('').messages({
    'string.base': 'Invalid address.',
    'string.empty': 'Invalid address.'
  }),
  complement: Joi.string().trim().allow('').messages({
    'string.base': 'Invalid complement.',
    'string.empty': 'Invalid complement.'
  }),
  zip_code: Joi.string()
    .regex(/^\d{8}$/)
    .trim()
    .allow('')
    .messages({
      'string.pattern.base': 'Invalid CEP.',
      'string.length': 'Invalid CEP.',
      'string.empty': 'Invalid CEP.'
    }),
  district: Joi.string().trim().allow('').messages({
    'string.base': 'Invalid neighborhood.',
    'string.empty': 'Invalid neighborhood.'
  }),
  city: Joi.string().trim().allow('').messages({
    'string.base': 'Invalid city.',
    'string.empty': 'Invalid city.'
  }),
  uf: Joi.string()
    .regex(/^[A-Z]{2}$/)
    .trim()
    .allow('')
    .messages({
      'string.pattern.base': 'Invalid state.',
      'string.length': 'Invalid state.',
      'string.empty': 'Invalid state.'
    })
});
