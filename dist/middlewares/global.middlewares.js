"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validUser = exports.validId = exports.validHydrometerId = void 0;
var _mongoose = _interopRequireDefault(require("mongoose"));
var _userService = _interopRequireDefault(require("../services/user.service.js"));
var _hydrometerService = require("../services/hydrometer.service.js");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const validId = (req, res, next) => {
  try {
    const id = req.params.id;
    if (!_mongoose.default.Types.ObjectId.isValid(id)) {
      return res.status(400).send({
        message: "invalid ID"
      });
    }
    next();
  } catch (err) {
    res.status(500).send({
      message: err.message
    });
  }
};
exports.validId = validId;
const validUser = async (req, res, next) => {
  try {
    const id = req.params.id;
    const user = await _userService.default.findByIdService(id);
    if (!user) {
      return res.status(400).send({
        message: "User not found"
      });
    }
    req.id = id;
    req.user = user;
    next();
  } catch (err) {
    res.status(500).send({
      message: err.message
    });
  }
};
exports.validUser = validUser;
const validHydrometerId = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!_mongoose.default.Types.ObjectId.isValid(id)) {
      return res.status(400).send({
        message: "Invalid Hydrometer ID"
      });
    }
    const hydrometer = await (0, _hydrometerService.findValveStateByIdService)(id);
    if (!hydrometer) {
      return res.status(404).send({
        message: "Hydrometer not found"
      });
    }
    req.hydrometer = hydrometer; // Armazena o hidrômetro no objeto de requisição, se necessário

    next();
  } catch (err) {
    res.status(500).send({
      message: err.message
    });
  }
};
exports.validHydrometerId = validHydrometerId;