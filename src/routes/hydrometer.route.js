import { Router } from "express";
import hydrometerController from "../controllers/hydrometer.controller.js";
import { validHydrometerId } from "../middlewares/global.middlewares.js";

const router = Router();

router.post("/", hydrometerController.create);
router.get("/", hydrometerController.findAll);
router.get("/:id",  hydrometerController.findById);
router.patch("/:id", validHydrometerId, hydrometerController.update);
router.get("/:id/valve-status", validHydrometerId, hydrometerController.valveStatus);

export default router;
