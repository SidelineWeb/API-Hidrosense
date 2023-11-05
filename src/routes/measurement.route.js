import { Router } from "express";
import measurementController from "../controllers/measurement.controller.js";
import {  } from "../middlewares/global.middlewares.js";

const router = Router();

router.post("/", measurementController.create);
router.get("/", measurementController.findAll);
router.get("/:id", measurementController.findById);
router.get("/:user", measurementController.findByUser);
router.get("/:hydrometer", measurementController.findByUser);

router.get("/", measurementController.getMonthMeasurement);
router.get("/", measurementController.getYearMeasurement);
router.get("/", measurementController.getDayMeasurement);
router.get("/", measurementController.getWeekMeasurement);

export default router;
