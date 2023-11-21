import mongoose from "mongoose";
import userService from "../services/user.service.js";
import { findValveStateByIdService } from "../services/hydrometer.service.js";

export const validId = (req, res, next) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({ message: "invalid ID" });
    }

    next();
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const validUser = async (req, res, next) => {
  try {
    const id = req.params.id;

    const user = await userService.findByIdService(id);

    if (!user) {
      return res.status(400).send({ message: "User not found" });
    }

    req.id = id;
    req.user = user;

    next();
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const validHydrometerId = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({ message: "Invalid Hydrometer ID" });
    }

    const hydrometer = await findValveStateByIdService(id);

    if (!hydrometer) {
      return res.status(404).send({ message: "Hydrometer not found" });
    }

    req.hydrometer = hydrometer; // Armazena o hidrômetro no objeto de requisição, se necessário

    next();
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// Função genérica para calcular totais por período
export const calculateTotals = async (matchStage) => {
  return await Measurement.aggregate([
      { $match: matchStage },
      {
          $group: {
              _id: null,
              totalLiters: { $sum: "$valueliters" },
              totalMcubic: { $sum: "$valueMcubic" }
          }
      }
  ]);
};