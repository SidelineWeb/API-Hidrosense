import { Router } from "express";
import userController from "../controllers/user.controller.js";
import { validId, validUser } from "../middlewares/global.middlewares.js";
import authMiddleware from '../middlewares/jwtMiddleware.js';

const router = Router();

router.post("/", userController.create);
router.post("/register", authMiddleware, userController.registerUser);

router.patch("/:id", validId, validUser, userController.update);

router.get("/", userController.findAll);
router.get("/:id", validId, validUser, userController.findById);
router.get("/:id/role", validId, validUser, userController.findUserRoleById);

export default router;
