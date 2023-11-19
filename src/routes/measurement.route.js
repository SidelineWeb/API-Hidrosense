import { Router } from "express";
import measurementController from "../controllers/measurement.controller.js";
import { validId, validUser } from "../middlewares/global.middlewares.js";

const router = Router();

//Crud
router.post("/", measurementController.create);
router.get("/", measurementController.findAll);
router.get("/:hydrometer", measurementController.findByHydrometer);

//ADM/Master
// Info charts
router.get("/monthMeasurement", measurementController.getCurentMonthMeasurementLiters);

// filtros - Medição User por Hydrometer - Custom
router.get("/user-month-liters", measurementController.getCustomMonthLitersByUser);

router.get("/user-year-liters", measurementController.getCustomYearLitersByUser);

router.get("/user-day-liters", measurementController.geCustomDayLitersByUser); // ao passar os parametros http://api/measurements/user-day-liters?date=2023-03-15

router.get("/user-week-liters", measurementController.getCustomWeekLitersByUser);

export default router;
