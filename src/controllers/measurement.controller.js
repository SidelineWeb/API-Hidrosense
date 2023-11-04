import {  } from "../services/measurement.service.js";

const create = async (req, res) => { };

const findAll = async (req, res) => { };

const findById = async (req, res) => { };

const findByUser = async (req, res) => { };

const findByHydrometer = async (req, res) => { };

// filtros - Medição Geral

const getMonthMeasurement = async (req, res) => { };

const getYearMeasurement = async (req, res) => { };

const getDayMeasurement = async (req, res) => { };

const getWeekMeasurement = async (req, res) => { };

// filtros - Medição por user

const getMonthMeasurementByUser = async (req, res) => { };

const getYearMeasurementByUser = async (req, res) => { };

const getDayMeasurementByUser = async (req, res) => { };

const getWeekMeasurementByUser = async (req, res) => { };


export { create, findAll, findById, findByUser, findByHydrometer, getMonthMeasurement, getYearMeasurement, getDayMeasurement, getWeekMeasurement};
