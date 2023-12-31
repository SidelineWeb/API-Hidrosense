import User from "../models/User.js";

const createService = (body) => User.create(body);

const findAllService = () => User.find();

const findByIdService = (id) => User.findById(id);

const findUserRoleByIdService = (id) => User.findById(id).select('role');

const updateService = (id, name, ident, email, cpf) =>
  User.findOneAndUpdate({ _id: id }, { id, name, ident, email, cpf });
  

export default {
  createService,
  findAllService,
  findByIdService,
  updateService,
  findUserRoleByIdService,
};
