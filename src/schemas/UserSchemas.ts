import Joi from 'joi';
import { cpf } from 'cpf-cnpj-validator';
import { isValidNumber, CountryCode } from 'libphonenumber-js';

export const RegisterUserSchema = Joi.object({
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
    .allow('')
    .messages({
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
    .allow('')
    .messages({
      'any.invalid': 'Invalid phone number.',
      'string.pattern.base': 'Invalid phone number.',
      'string.length': 'Invalid phone number.'
    }),
  password: Joi.string().min(5).required().messages({
    'any.required': 'The password is required.',
    'string.empty': 'The password is required.',
    'string.min': 'The password must contain at least 5 characters.'
  }),
  confirmPassword: Joi.any().valid(Joi.ref('password')).required().messages({
    'any.only': 'The passwords do not match.',
    'any.required': 'The password confirmation is required.',
    'any.empty': 'The password confirmation is required.'
  })
});

export const LoginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'The e-mail must be valid.',
    'any.required': 'The e-mail is required.',
    'string.empty': 'The e-mail is required.'
  }),
  password: Joi.string().min(5).required().messages({
    'any.required': 'The password is required.',
    'string.empty': 'The password is required.',
    'string.min': 'The password must contain at least 5 characters.'
  })
});

export const UpdateUserSchema = Joi.object({
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
    .allow('')
    .messages({
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
    .allow('')
    .messages({
      'any.invalid': 'Invalid phone number.',
      'string.pattern.base': 'Invalid phone number.',
      'string.length': 'Invalid phone number.'
    }),
  password: Joi.string().min(5).required().messages({
    'any.required': 'The password is required.',
    'string.empty': 'The password is required.',
    'string.min': 'The password must contain at least 5 characters.'
  })
});

export const NewPasswordSchema = Joi.object({
  password: Joi.string().min(5).required().messages({
    'any.required': 'The password is required.',
    'string.empty': 'The password is required.',
    'string.min': 'The password must contain at least 5 characters.'
  }),
  newPassword: Joi.string().min(5).required().messages({
    'any.required': 'The new password is required.',
    'string.empty': 'The new password is required.',
    'string.min': 'The new password must contain at least 5 characters.'
  }),
  confirmNewPassword: Joi.any().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'The passwords do not match.',
    'any.required': 'The new password confirmation is required.',
    'any.empty': 'The new password confirmation is required.'
  })
});
