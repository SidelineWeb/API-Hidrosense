import Measurement from "../models/Measurement.js";

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
  };
