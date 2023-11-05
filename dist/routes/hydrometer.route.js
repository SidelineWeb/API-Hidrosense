"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _express = require("express");
var _hydrometerController = _interopRequireDefault(require("../controllers/hydrometer.controller.js"));
var _globalMiddlewares = require("../middlewares/global.middlewares.js");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const router = (0, _express.Router)();
router.post("/", _hydrometerController.default.create);
router.get("/", _hydrometerController.default.findAll);
router.get("/:id", _hydrometerController.default.findById);
router.patch("/:id", _globalMiddlewares.validHydrometerId, _hydrometerController.default.update);
router.get("/:id/valve-status", _globalMiddlewares.validHydrometerId, _hydrometerController.default.valveStatus);
var _default = exports.default = router;