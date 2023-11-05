"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _mongoose = _interopRequireDefault(require("mongoose"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const connectDatabase = () => {
  console.log("Wait connecting to the database");
  _mongoose.default.connect(process.env.MONGODB_URI).then(() => console.log("MongoDB Atlas Connected")).catch(error => console.log(error));
};
var _default = exports.default = connectDatabase;