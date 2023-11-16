import { Router } from "express";
import measurementController from "../controllers/measurement.controller.js";
import { validId, validUser } from "../middlewares/global.middlewares.js";

const router = Router();

router.post("/", measurementController.create);
router.get("/", measurementController.findAll);
router.get("/:id", measurementController.findById);
router.get("/:hydrometer", measurementController.findByHydrometer);

router.get("/", measurementController.getMonthMeasurement);
router.get("/", measurementController.getYearMeasurement);
router.get("/", measurementController.getDayMeasurement);
router.get("/", measurementController.getWeekMeasurement);

export default router;
