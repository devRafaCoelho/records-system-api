import Joi from 'joi';
import { cpf } from 'cpf-cnpj-validator';
import { isValidNumber, CountryCode } from 'libphonenumber-js';

export const RegisterUserSchema = Joi.object({
  firstName: Joi.string().required().messages({
    'any.required': 'The firstName is required.',
    'string.empty': 'The firstName is required.',
    'string.base': 'The firstName must be a valid name.'
  }),
  lastName: Joi.string().required().messages({
    'any.required': 'The lastName is required.',
    'string.empty': 'The lastName is required.',
    'string.base': 'The lastName must be a valid name.'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'O Email precisa ser válido.',
    'any.required': 'The email is required.',
    'string.empty': 'The email is required.'
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
    'any.required': 'The password is required.',
    'string.empty': 'The password is required.',
    'string.min': 'A Senha precisa conter, no mínimo, 5 caracteres.'
  }),
  confirmPassword: Joi.any().valid(Joi.ref('password')).required().messages({
    'any.only': 'As senhas não coincidem.',
    'any.required': 'The confirmPassword is required.',
    'any.empty': 'The confirmPassword is required.'
  })
});

export const LoginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'O Email precisa ser válido.',
    'any.required': 'O Email é obrigatório.',
    'string.empty': 'O Email é obrigatório.'
  }),
  password: Joi.string().min(5).required().messages({
    'any.required': 'A Senha é obrigatória.',
    'string.empty': 'A Senha é obrigatória.',
    'string.min': 'A Senha precisa conter, no mínimo, 5 caracteres.'
  })
});

export const UpdateUserSchema = Joi.object({
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
  })
});

export const NewPasswordSchema = Joi.object({
  password: Joi.string().min(5).required().messages({
    'any.required': 'A Senha é obrigatória.',
    'string.empty': 'A Senha é obrigatória.',
    'string.min': 'A Senha precisa conter, no mínimo, 5 caracteres.'
  }),
  newPassword: Joi.string().min(5).required().messages({
    'any.required': 'A Nova Senha é obrigatória.',
    'string.empty': 'A Nova Senha é obrigatória.',
    'string.min': 'A Nova Senha precisa conter, no mínimo, 5 caracteres.'
  }),
  confirmNewPassword: Joi.any().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'As senhas não coincidem.',
    'any.required': 'A Confirmação da Nova Senha é obrigatória.',
    'any.empty': 'A Confirmação da Nova Senha é obrigatória.'
  })
});
