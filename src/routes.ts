import { Router } from 'express';
import { getUser, login, registerUser, updateUser } from './controllers/UserController';
import { validateAuthentication } from './middlewares/ValidateAuthentication';
import { ValidateRequest } from './middlewares/validateRequest';
import { RegisterUserSchema, LoginSchema, UpdateUserSchema } from './schemas/UserSchema';

const routes = Router();

routes.post('/user/register', ValidateRequest(RegisterUserSchema), registerUser);
routes.post('/user/login', ValidateRequest(LoginSchema), login);

routes.use(validateAuthentication);

routes.get('/user/data', getUser);
routes.put('/user/update', ValidateRequest(UpdateUserSchema), updateUser);

export default routes;
