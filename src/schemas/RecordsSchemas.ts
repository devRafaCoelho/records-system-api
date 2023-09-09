import Joi from 'joi';
import JoiDate from '@joi/date';

const JoiExtended = Joi.extend(JoiDate);

export const RegisterRecordSchema = Joi.object({
  id_clients: Joi.number().required().messages({
    'any.required': 'O id do cliente é obrigatório',
    'string.empty': 'O id do cliente é obrigatório',
    'number.empty': 'O id do cliente é obrigatório'
  }),
  description: Joi.string().max(100).required().messages({
    'string.max': 'A descrição precisa conter, no máximo, 500 caracteres',
    'any.required': 'A descrição é obrigatória',
    'string.empty': 'A descrição é obrigatória'
  }),
  due_date: JoiExtended.date().format('DD-MM-YYYY').required().messages({
    'date.format': 'Data inválida',
    'any.required': 'A data de vencimento é obrigatória',
    'number.empty': 'O valor da data é obrigatório',
    'number.base': 'O valor da data precisa ser um número'
  }),
  value: Joi.number().required().messages({
    'any.required': 'O valor da cobrança é obrigatório',
    'number.base': 'O valor da cobrança precisa ser um número'
  }),
  paid_out: Joi.boolean().required().messages({
    'any.required': 'O status de pagamento é obrigatório',
    'boolean.empty': 'O status de pagamento é obrigatório'
  })
});
