import Joi from 'joi';
import { cpf } from 'cpf-cnpj-validator';
import { isValidNumber, CountryCode } from 'libphonenumber-js';

export const UserSchema = Joi.object({
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
    .allow('')
    .messages({
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
    .allow('')
    .messages({
      'any.invalid': 'Número de telefone inválido',
      'string.pattern.base': 'Número de telefone inválido',
      'string.length': 'Número de telefone inválido'
    }),
  password: Joi.string().min(5).required().messages({
    'any.required': 'A Senha é obrigatória.',
    'string.empty': 'A Senha é obrigatória.',
    'string.min': 'A Senha precisa conter, no mínimo, 5 caracteres.'
  }),
  confirmPassword: Joi.any().valid(Joi.ref('password')).required().messages({
    'any.only': 'As senhas não coincidem.',
    'any.required': 'A confirmação da senha é obrigatória.',
    'any.empty': 'A confirmação da senha é obrigatória.'
  })
});
