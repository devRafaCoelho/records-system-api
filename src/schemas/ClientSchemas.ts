import Joi from 'joi';
import { cpf } from 'cpf-cnpj-validator';
import { isValidNumber, CountryCode } from 'libphonenumber-js';

export const RegisterClientSchema = Joi.object({
  firstName: Joi.string().required().messages({
    'any.required': 'O Primeiro Nome é obrigatório.',
    'string.empty': 'O Primeiro Nome é obrigatório.',
    'string.base': 'O Primeiro Nome precisa ser um nome válido.'
  }),
  lastName: Joi.string().required().messages({
    'any.required': 'O Último Nome é obrigatório.',
    'string.empty': 'O Último Nome é obrigatório.',
    'string.base': 'O Último Nome precisa ser um nome válido.'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'O Email precisa ser válido.',
    'any.required': 'O Email é obrigatório.',
    'string.empty': 'O Email é obrigatório.'
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
      'any.required': 'O CPF é obrigatório.',
      'string.empty': 'O CPF é obrigatório.',
      'any.invalid': 'CPF inválido',
      'string.pattern.base': 'CPF inválido',
      'string.length': 'CPF inválido'
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
      'any.required': 'O Número de telefone é obrigatório.',
      'string.empty': 'O Número de telefone é obrigatório.',
      'any.invalid': 'Número de telefone inválido',
      'string.pattern.base': 'Número de telefone inválido',
      'string.length': 'Número de telefone inválido'
    }),
  address: Joi.string().trim().messages({
    'string.base': 'Endereço inválido',
    'string.empty': 'Endereço inválido'
  }),
  complement: Joi.string().trim().messages({
    'string.base': 'Complemento inválido',
    'string.empty': 'Complemento inválido'
  }),
  zip_code: Joi.string()
    .regex(/^\d{8}$/)
    .trim()
    .messages({
      'string.pattern.base': 'O campo CEP deve ser composto por apenas 8 números',
      'string.length': 'O campo CEP deve ser composto por apenas 8 números',
      'string.empty': 'O campo CEP deve ser composto por apenas 8 números'
    }),
  district: Joi.string().trim().messages({
    'string.base': 'Bairro inválido',
    'string.empty': 'Bairro inválido'
  }),
  city: Joi.string().trim().messages({
    'string.base': 'Cidade inválida',
    'string.empty': 'Cidade inválida'
  }),
  uf: Joi.string()
    .regex(/^[A-Z]{2}$/)
    .trim()
    .messages({
      'string.pattern.base': 'O campo Estado deve ser composto por apenas duas letras maiúsculas',
      'string.length': 'O campo Estado deve ser composto por apenas duas letras maiúsculas',
      'string.empty': 'O campo Estado deve ser composto por apenas duas letras maiúsculas'
    })
});
