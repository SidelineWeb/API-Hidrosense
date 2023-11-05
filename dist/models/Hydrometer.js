"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _mongoose = _interopRequireDefault(require("mongoose"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const HydrometerSchema = new _mongoose.default.Schema({
  location: {
    type: String,
    required: true
  },
  model: {
    type: String,
    required: true
  },
  serialNumber: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  valveState: {
    type: Boolean,
    required: true,
    default: false // falso para aberta, Verdadeiro para fechada
  }
  // Você pode adicionar mais campos conforme necessário
});

const Hydrometer = _mongoose.default.model("Hydrometer", HydrometerSchema);
var _default = exports.default = Hydrometer;