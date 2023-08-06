import { Router } from 'express';
import { getUser, login, registerUser } from './controllers/UserController';
import { UserSchema } from './schemas/UserSchema';
import { ValidateRequest } from './middlewares/ValidateRequest';
import { LoginSchema } from './schemas/LoginSchema';
import { validateAuthentication } from './middlewares/ValidateAuthentication';

const routes = Router();

routes.post('/user/register', ValidateRequest(UserSchema), registerUser);
routes.post('/user/login', ValidateRequest(LoginSchema), login);

routes.use(validateAuthentication);

routes.get('/user/data', getUser);

export default routes;
