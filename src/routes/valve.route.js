import { Router } from "express";
import valveController from "../controllers/valve.controller.js";

const router = Router();

router.post("/", valveController.create);
router.get("/", valveController.findAll);
router.get("/:id",  valveController.findById);

export default router;
