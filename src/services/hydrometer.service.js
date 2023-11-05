import Hydrometer from "../models/Hydrometer.js";

const createService = (body) => User.create(body);

const findAllService = () => User.find();

const findByIdService = (id) => User.findById(id);

const findByUserService = (user) => User.findByUser(user);

const findValveStateByIdService = (id) => Hydrometer.findById(id).select('valveState');

const updateService = (id, location, model, serialNumber, user, valveState) =>
  User.findOneAndUpdate({ _id: id }, { id, location, model, serialNumber, user, valveState});

  export {
    createService,
    findAllService,
    findByIdService,
    updateService,
    findValveStateByIdService,
  };
