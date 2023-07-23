import { Router } from 'express';
import { registerUser } from './controllers/UserController';
import { UserSchema } from './schemas/UserSchema';
import { ValidateRequest } from './middlewares/ValidateRequest';

const routes = Router();

routes.post('/user/register', ValidateRequest(UserSchema), registerUser);

export default routes;
