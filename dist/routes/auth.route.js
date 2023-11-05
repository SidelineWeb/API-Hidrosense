"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _express = require("express");
var _authController = require("../controllers/auth.controller.js");
const router = (0, _express.Router)();
router.post("/", _authController.login);
var _default = exports.default = router;