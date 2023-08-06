import Joi from 'joi';

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
