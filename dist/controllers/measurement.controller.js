"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getYearMeasurement = exports.getWeekMeasurement = exports.getMonthMeasurement = exports.getDayMeasurement = exports.findByUser = exports.findById = exports.findByHydrometer = exports.findAll = exports.create = void 0;
require("../services/measurement.service.js");
const create = async (req, res) => {};
exports.create = create;
const findAll = async (req, res) => {};
exports.findAll = findAll;
const findById = async (req, res) => {};
exports.findById = findById;
const findByUser = async (req, res) => {};
exports.findByUser = findByUser;
const findByHydrometer = async (req, res) => {};

// filtros - Medição Geral
exports.findByHydrometer = findByHydrometer;
const getMonthMeasurement = async (req, res) => {};
exports.getMonthMeasurement = getMonthMeasurement;
const getYearMeasurement = async (req, res) => {};
exports.getYearMeasurement = getYearMeasurement;
const getDayMeasurement = async (req, res) => {};
exports.getDayMeasurement = getDayMeasurement;
const getWeekMeasurement = async (req, res) => {};

// filtros - Medição por user
exports.getWeekMeasurement = getWeekMeasurement;
const getMonthMeasurementByUser = async (req, res) => {};
const getYearMeasurementByUser = async (req, res) => {};
const getDayMeasurementByUser = async (req, res) => {};
const getWeekMeasurementByUser = async (req, res) => {};