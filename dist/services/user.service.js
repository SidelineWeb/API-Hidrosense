"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _User = _interopRequireDefault(require("../models/User.js"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const createService = body => _User.default.create(body);
const findAllService = () => _User.default.find();
const findByIdService = id => _User.default.findById(id);
const updateService = (id, name, ident, email, cpf) => _User.default.findOneAndUpdate({
  _id: id
}, {
  id,
  name,
  ident,
  email,
  cpf
});
var _default = exports.default = {
  createService,
  findAllService,
  findByIdService,
  updateService
};