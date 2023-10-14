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
import {
  validateListRecordsData,
  validateRecordData,
  validateRegisterRecordData
} from './middlewares/ValidateRecordData';
import {
  validateLoginData,
  validateNewPasswordData,
  validateRegisterUserData,
  validateUpdateUserData
} from './middlewares/ValidateUserData';
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

routes.post('/user', ValidateRequest(RegisterUserSchema), validateRegisterUserData, registerUser);
routes.post('/login', ValidateRequest(LoginSchema), validateLoginData, login);

routes.use(validateAuthentication);

routes.get('/user', getUser);
routes.put('/user', ValidateRequest(UpdateUserSchema), validateUpdateUserData, updateUser);
routes.put(
  '/user/newPassword',
  ValidateRequest(NewPasswordSchema),
  validateNewPasswordData,
  newPassword
);
routes.delete('/user', deleteUser);

routes.post('/client', ValidateRequest(ClientSchema), validateRegisterClientData, registerClient);
routes.get('/client/:id', validateClientData, getClient);
routes.get('/client', validateListClientsData, listClients);
routes.put('/client/:id', ValidateRequest(ClientSchema), validateUpdateClientData, updateClient);
routes.delete('/client/:id', validateClientData, deleteClient);

routes.post(
  '/record',
  ValidateRequest(RegisterRecordSchema),
  validateRegisterRecordData,
  registerRecord
);
routes.get('/record/:id', validateRecordData, getRecord);
routes.get('/record', validateListRecordsData, listRecords);
routes.put('/record/:id', validateRecordData, updateRecord);
routes.delete('/record/:id', validateRecordData, deleteRecord);

// routes.get('/home', home);

export default routes;
