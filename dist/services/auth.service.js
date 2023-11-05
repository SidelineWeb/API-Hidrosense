"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loginService = exports.generateToken = void 0;
var _User = _interopRequireDefault(require("../models/User.js"));
var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const loginService = email => _User.default.findOne({
  email: email
}).select("+password");
exports.loginService = loginService;
const generateToken = id => _jsonwebtoken.default.sign({
  id: id
}, process.env.SECRET_JWT, {
  expiresIn: 86400
});
exports.generateToken = generateToken;