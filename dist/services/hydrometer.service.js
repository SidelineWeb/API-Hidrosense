"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateService = exports.findValveStateByIdService = exports.findByIdService = exports.findAllService = exports.createService = void 0;
var _Hydrometer = _interopRequireDefault(require("../models/Hydrometer.js"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const createService = body => _Hydrometer.default.create(body);
exports.createService = createService;
const findAllService = () => _Hydrometer.default.find();
exports.findAllService = findAllService;
const findByIdService = id => _Hydrometer.default.findById(id);
exports.findByIdService = findByIdService;
const findByUserService = user => _Hydrometer.default.findByUser(user);
const findValveStateByIdService = id => _Hydrometer.default.findById(id).select('valveState');
exports.findValveStateByIdService = findValveStateByIdService;
const updateService = (id, updateData) => _Hydrometer.default.findByIdAndUpdate(id, updateData, {
  new: true
});
exports.updateService = updateService;