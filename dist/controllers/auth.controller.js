"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.login = void 0;
var _bcrypt = _interopRequireDefault(require("bcrypt"));
var _authService = require("../services/auth.service.js");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const login = async (req, res) => {
  const {
    email,
    password
  } = req.body;
  try {
    const user = await (0, _authService.loginService)(email);
    if (!user) {
      return res.status(404).send({
        message: "User or password not found"
      });
    }
    const passwordIsValid = _bcrypt.default.compareSync(password, user.password);
    if (!passwordIsValid) {
      return res.status(404).send({
        message: "User or password not found"
      });
    }
    const token = (0, _authService.generateToken)(user.id);
    res.send({
      token
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
};
exports.login = login;