"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _express = require("express");
var _measurementController = _interopRequireDefault(require("../controllers/measurement.controller.js"));
require("../middlewares/global.middlewares.js");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const router = (0, _express.Router)();
router.post("/", _measurementController.default.create);
router.get("/", _measurementController.default.findAll);
router.get("/:id", _measurementController.default.findById);
router.get("/:user", _measurementController.default.findByUser);
router.get("/:hydrometer", _measurementController.default.findByUser);
router.get("/", _measurementController.default.getMonthMeasurement);
router.get("/", _measurementController.default.getYearMeasurement);
router.get("/", _measurementController.default.getDayMeasurement);
router.get("/", _measurementController.default.getWeekMeasurement);
var _default = exports.default = router;