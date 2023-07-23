import { Router } from 'express';
import { login, registerUser } from './controllers/UserController';
import { UserSchema } from './schemas/UserSchema';
import { ValidateRequest } from './middlewares/ValidateRequest';
import { LoginSchema } from './schemas/LoginSchema';

const routes = Router();

routes.post('/user/register', ValidateRequest(UserSchema), registerUser);
routes.post('/user/login', ValidateRequest(LoginSchema), login);

export default routes;
