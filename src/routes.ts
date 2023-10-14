import { Router } from 'express';
import {
  deleteClient,
  getClient,
  listClients,
  registerClient,
  updateClient
} from './controllers/ClientControler';
import {
  deleteRecord,
  getRecord,
  listRecords,
  registerRecord,
  updateRecord
} from './controllers/RecordController';
import {
  deleteUser,
  getUser,
  login,
  newPassword,
  registerUser,
  updateUser
} from './controllers/UserController';
import { validateAuthentication } from './middlewares/ValidateAuthentication';
import {
  validateClientData,
  validateListClientsData,
  validateRegisterClientData,
  validateUpdateClientData
} from './middlewares/ValidateClientData';
import { ValidateRequest } from './middlewares/validateRequest';
import { ClientSchema } from './schemas/ClientSchemas';
import { RegisterRecordSchema } from './schemas/RecordsSchemas';
import {
  LoginSchema,
  NewPasswordSchema,
  RegisterUserSchema,
  UpdateUserSchema
} from './schemas/UserSchemas';

const routes = Router();

routes.post('/user', ValidateRequest(RegisterUserSchema), registerUser);
routes.post('/login', ValidateRequest(LoginSchema), login);

routes.use(validateAuthentication);

routes.get('/user', getUser);
routes.put('/user', ValidateRequest(UpdateUserSchema), updateUser);
routes.put('/user/newPassword', ValidateRequest(NewPasswordSchema), newPassword);
routes.delete('/user', deleteUser);

routes.post('/client', ValidateRequest(ClientSchema), validateRegisterClientData, registerClient);
routes.get('/client/:id', validateClientData, getClient);
routes.get('/client', validateListClientsData, listClients);
routes.put('/client/:id', ValidateRequest(ClientSchema), validateUpdateClientData, updateClient);
routes.delete('/client/:id', validateClientData, deleteClient);

routes.post('/record', ValidateRequest(RegisterRecordSchema), registerRecord);
routes.get('/record', listRecords);
routes.get('/record/:id', getRecord);
routes.put('/record/:id', updateRecord);
routes.delete('/record/:id', deleteRecord);

// routes.get('/home', home);

export default routes;
