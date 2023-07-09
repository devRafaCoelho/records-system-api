import { Router } from 'express';
import { validateRequest } from './middlewares/validateRequest';
import { userRegisterSchema } from './schemas/UserSchemas';
import { registerUser } from './controllers/UserController';

const routes = Router();

routes.post('/user/register', validateRequest(userRegisterSchema), registerUser);

export default routes;
