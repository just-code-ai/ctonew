import { Router } from 'express';
import { register, login, refresh } from '../controllers/authController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { registerSchema, loginSchema, refreshSchema } from '../schemas/authSchemas.js';

const router = Router();

router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.post('/refresh', validateRequest(refreshSchema), refresh);

export default router;
