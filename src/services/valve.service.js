import Valve from "../models/Valve.js";

const createService = (body) => Valve.create(body);

const findAllService = () => Valve.find();

const findByIdService = (id) => Valve.findById(id);

const findByHydrometerService = (hydrometer) => Valve.findByHydrometer(hydrometer);

  export {
    createService,
    findAllService,
    findByIdService,
    findByHydrometerService,
  };
