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
} from './schemas/UserSchema';

const routes = Router();

routes.post('/user', ValidateRequest(RegisterUserSchema), registerUser);
routes.post('/login', ValidateRequest(LoginSchema), login);

routes.use(validateAuthentication);

routes.get('/user/', getUser);
routes.put('/user/', ValidateRequest(UpdateUserSchema), updateUser);
routes.put('/user/newPassword', ValidateRequest(NewPasswordSchema), newPassword);
routes.delete('/user', deleteUser);

export default routes;
