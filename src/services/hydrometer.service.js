import Hydrometer from "../models/Hydrometer.js";

const createService = (body) => Hydrometer.create(body);

const findAllService = () => Hydrometer.find();

const findByIdService = (id) => Hydrometer.findById(id);

const findByUserService = (user) => Hydrometer.findByUser(user);

const findValveStateByIdService = (hydrometer) => Hydrometer.findById(hydrometer).select('valveState');

const updateService = (id, updateData) =>
  Hydrometer.findByIdAndUpdate(id, updateData, { new: true });

  export {
    createService,
    findAllService,
    findByIdService,
    updateService,
    findValveStateByIdService,
    findByUserService,
  };
