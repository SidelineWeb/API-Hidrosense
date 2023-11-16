import { Router } from "express";
import authMiddleware from '../middlewares/jwtMiddleware.js';

const router = Router();

import { login } from "../controllers/auth.controller.js"

router.post("/", login);

export default router;
