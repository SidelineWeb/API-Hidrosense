"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _express = require("express");
var _userController = _interopRequireDefault(require("../controllers/user.controller.js"));
var _globalMiddlewares = require("../middlewares/global.middlewares.js");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const router = (0, _express.Router)();
router.post("/", _userController.default.create);
router.get("/", _userController.default.findAll);
router.get("/:id", _globalMiddlewares.validId, _globalMiddlewares.validUser, _userController.default.findById);
router.patch("/:id", _globalMiddlewares.validId, _globalMiddlewares.validUser, _userController.default.update);
var _default = exports.default = router;