import { Router } from "express";
import measurementController from "../controllers/measurement.controller.js";
import { validId, validUser } from "../middlewares/global.middlewares.js";

const router = Router();


router.post("/", measurementController.create);
router.get("/", measurementController.findAll);
router.get("/:hydrometer", measurementController.findByHydrometer);


export default router;
