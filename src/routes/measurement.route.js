import { Router } from "express";
import measurementController from "../controllers/measurement.controller.js";
import authMiddleware from '../middlewares/jwtMiddleware.js';


const router = Router();

//Crud
router.post("/", measurementController.create);
router.get("/", measurementController.findAll);
router.get("/by-hydrometer/:hydrometer", measurementController.findByHydrometer);

// Info charts - Total
router.get("/total-month-liters", measurementController.getCurentMonthMeasurementLiters);
router.get("/total-month-mcubic", measurementController.getCurentMonthMeasurementMcubic);
router.get("/total-month-bill", measurementController.getCurentMonthBilling);
router.get("/total-month-prev", measurementController.getCurentMonthPrev);

// filtros - Medição Geral
router.get("/monthday-liters", measurementController.getCurrentLitersPerDay);
router.get("/custom-monthday-liters", measurementController.getCustomLitersPerDay);
router.get("/month-liters", measurementController.getCurrentLitersPerMonth);
router.get("/custom-month-liters", measurementController.getCustomLitersPerMonth);
router.get("/weekdays-liters", measurementController.getCurrentLitersPerWeekDay);
router.get("/custom-weekdays-liters", measurementController.getCustomLitersPerWeekDay);
router.get("/hour-liters", measurementController.geCurrentLitersPerHour);
router.get("/custom-hour-liters", measurementController.geCustomLitersPerHour);

router.get("/monthday-mcubic", measurementController.getCurrentMcubicPerDay);
router.get("/custom-monthday-mcubic", measurementController.getCustomMcubicPerDay);
router.get("/month-mcubic", measurementController.getCurrentMcubicPerMonth);
router.get("/custom-month-mcubic", measurementController.getCustomMcubicPerMonth);
router.get("/weekday-mcubic", measurementController.getCurrentMcubicPerWeekday);
router.get("/custom-weekday-mcubic", measurementController.getCustomMcubicPerWeekday);
router.get("/hour-mcubic", measurementController.getCurrentMcubicPerHour);
router.get("/custom-hour-mcubic", measurementController.getCustomMcubicPerHour);

// Info Charts - User por Hydrometer
router.get("/user-total-month-liters", measurementController.getCurentMonthMeasurementLitersByUser);
router.get("/user-total-month-mcubic", measurementController.getCurentMonthMeasurementMcubicByUser);
router.get("/user-total-month-bill", measurementController.getCurentMonthBillingByUser);
router.get("/user-total-month-prev", measurementController.getCurentMonthPrevByUser);

// filtros - Medição User por Hydrometer 
router.get("/user-month-liters",authMiddleware, measurementController.getCurrentMonthLitersByUser);
router.get("/user-month-liters",authMiddleware, measurementController.getCustomMonthLitersByUser);
router.get("/user-year-liters",authMiddleware, measurementController.getCurrentYearLitersByUser);
router.get("/user-year-liters",authMiddleware, measurementController.getCustomYearLitersByUser);
router.get("/user-day-liters",authMiddleware, measurementController.geCurrentDayLitersByUser);
router.get("/user-day-liters",authMiddleware, measurementController.geCustomDayLitersByUser); // ao passar os parametros http://api/measurements/user-day-liters?date=2023-03-15
router.get("/user-week-liters",authMiddleware, measurementController.getCurrentWeekLitersByUser);
router.get("/user-week-liters",authMiddleware, measurementController.getCustomWeekLitersByUser);

router.get("/user-month-mcubic",authMiddleware, measurementController.getCurrentMonthMcubicByUser);
router.get("/user-month-mcubic",authMiddleware, measurementController.getCustomMonthMcubicByUser);
router.get("/user-year-mcubic",authMiddleware, measurementController.getCurrentYearMcubicByUser);
router.get("/user-year-mcubic",authMiddleware, measurementController.getCustomYearMcubicByUser);
router.get("/user-day-mcubic",authMiddleware, measurementController.getCurrentDayMcubicByUser);
router.get("/user-day-mcubic",authMiddleware, measurementController.getCustomDayMcubicByUser); // ao passar os parametros http://api/measurements/user-day-liters?date=2023-03-15
router.get("/user-week-mcubic",authMiddleware, measurementController.getCurrentWeekMcubicByUser);
router.get("/user-week-mcubic",authMiddleware, measurementController.getCustomWeekMcubicByUser);

// Filtros - medição por hidrômetro
router.get('/total-month-liters-by-hidrometer/:hydrometerId', measurementController.getCurrentMonthMeasurementLitersByHydrometer);
router.get('/total-month-mcubic-by-hidrometer/:hydrometerId', measurementController.getCurrentMonthMeasurementMcubicByHydrometer);
// Info Charts - Hydrometer ID

// Rotas para buscar o consumo por hidrômetro com base no serial number
router.get('/hidrometer-total-month-liters/:serialNumber', measurementController.getCurrentMonthMeasurementLitersBySerial);
router.get('/hidrometer-total-month-mcubic/:serialNumber', measurementController.getCurrentMonthMeasurementMcubicBySerial);
router.get('/hidrometer-total-month-prev/:serialNumber', measurementController.getCurentMonthPrevBySerial);
router.get('/hidrometer-total-month-billing/:serialNumber', measurementController.getCurentMonthBillingBySerial);


 
export default router;
