"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _mongoose = _interopRequireDefault(require("mongoose"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const valveControlSchema = new _mongoose.default.Schema({
  hydrometer: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: 'Hydrometer',
    required: true
  },
  opened: {
    type: Boolean,
    required: true
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  }
});
const ValveControl = _mongoose.default.model("ValveControl", valveControlSchema);
var _default = exports.default = ValveControl;