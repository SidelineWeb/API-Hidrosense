import Measurement from "../models/Measurement.js";

// Função genérica para calcular totais por período
const calculateTotals = async (matchStage) => {
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

const createService = (body) => Measurement.create(body);

const findAllService = () => Measurement.find();

const findByIdService = (id) => Measurement.findById(id);

const findByHydrometerService = (HydrometerId) => Measurement.findByHydrometer({ hydrometer: HydrometerId });

const updateService = (id, updateData) =>
  Measurement.findByIdAndUpdate(id, updateData, { new: true });
  

  export {
    createService,
    findAllService,
    findByIdService,
    findByHydrometerService,
    updateService,
    calculateTotals,
  };
