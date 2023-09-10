import { Router } from 'express';
import {
  deleteUser,
  getUser,
  login,
  newPassword,
  registerUser,
  updateUser
} from './controllers/UserController';
import { validateAuthentication } from './middlewares/ValidateAuthentication';
import { ValidateRequest } from './middlewares/validateRequest';
import {
  RegisterUserSchema,
  LoginSchema,
  UpdateUserSchema,
  NewPasswordSchema
} from './schemas/UserSchemas';
import { RegisterClientSchema } from './schemas/ClientSchemas';
import {
  deleteClient,
  getClient,
  listClients,
  registerClient,
  updateClient
} from './controllers/ClienteControler';
import { RegisterRecordSchema } from './schemas/RecordsSchemas';
import {
  deleteRecord,
  getRecord,
  listRecords,
  registerRecord,
  updateRecord
} from './controllers/RecordController';
import { home } from './controllers/HomeController';

const routes = Router();

routes.post('/user', ValidateRequest(RegisterUserSchema), registerUser);
routes.post('/login', ValidateRequest(LoginSchema), login);

routes.use(validateAuthentication);

routes.get('/user', getUser);
routes.put('/user', ValidateRequest(UpdateUserSchema), updateUser);
routes.put('/user/newPassword', ValidateRequest(NewPasswordSchema), newPassword);
routes.delete('/user', deleteUser);

routes.post('/client', ValidateRequest(RegisterClientSchema), registerClient);
routes.get('/client', listClients);
routes.get('/client/:id', getClient);
routes.put('/client/:id', updateClient);
routes.delete('/client/:id', deleteClient);

routes.post('/record', ValidateRequest(RegisterRecordSchema), registerRecord);
routes.get('/record', listRecords);
routes.get('/record/:id', getRecord);
routes.put('/record/:id', updateRecord);
routes.delete('/record/:id', deleteRecord);

routes.get('/home', home);

export default routes;
