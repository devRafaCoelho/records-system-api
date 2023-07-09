const Joi = require('joi');
const { cpf } = require('cpf-cnpj-validator');
const { isValidNumber } = require('libphonenumber-js');

export const userRegisterSchema = Joi.object({
  firstName: Joi.string().required().messages({
    'any.required': 'O Primeiro Nome é obrigatório.',
    'string.empty': 'O Primeiro Nome é obrigatório.'
  }),
  lastName: Joi.string().required().messages({
    'any.required': 'O Último Nome é obrigatório.',
    'string.empty': 'O Último Nome é obrigatório.'
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
    .trim()
    .messages({
      'any.invalid': 'CPF inválido'
    }),
  phone: Joi.string()
    .custom((value: string, helpers: any) => {
      if (!isValidNumber(value, { defaultCountry: 'BR' })) {
        return helpers.error('any.invalid');
      }
      return value;
    })
    .trim()
    .messages({
      'any.invalid': 'Número de telefone inválido'
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
