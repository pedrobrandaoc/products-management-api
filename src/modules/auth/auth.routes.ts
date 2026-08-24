import { Router } from 'express';

import { registerController, loginController, logoutController, meController, csrfTokenController } from './auth.controller.js';
import { csrfProtection } from "../../middlewares/csrf.middleware.js";
import { requireAuth } from '../../middlewares/require-auth.middleware.js';
import { loginRateLimit, registerRateLimit } from "../../middlewares/auth-rate-limit.middleware.js"

const authRouter = Router();

// define a rota post de registro (rota, callback)
authRouter.post('/register', registerRateLimit, registerController);

// define a rota post de login
authRouter.post('/login', loginRateLimit, loginController);

//define rota de logout
authRouter.post('/logout', requireAuth, csrfProtection, logoutController);

// teste de recuperação de session (middleware requireAuth)
authRouter.get('/me', requireAuth, meController);

// criação do csrf token
authRouter.get('/csrf-token', csrfTokenController);

export { authRouter };
