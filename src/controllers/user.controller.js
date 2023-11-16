import userService from "../services/user.service.js";

const create = async (req, res) => {
  try {
    const { name, email, cpf, password, role } = req.body;

    if (!name || !email || !cpf || !password || !role) {
      res.status(400).send({ message: "Submit all fields for registration" });
    }

    const user = await userService.createService(req.body);

    if (!user) {
      return res.status(400).send({ message: "Error creating User" });
    }

    res.status(201).send({
      message: "user created successfully",
      user: {
        id: user._id,
        name,
        email,
        role,
      },
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const registerUser = async (req, res) => {
  try {

    const { role } = req.user; // Assumindo que o papel do usuário é anexado ao objeto req em algum middleware anterior

    const { name, email, cpf, password } = req.body;

    if (role !== 'admin') {
      return res.status(403).send({ message: "Access denied" })
    }

    if (!name || !email || !cpf || !password ) {
      res.status(400).send({ message: "Submit all fields for registration" });
    }

    const user = await userService.createService(req.body);

    if (!user) {
      return res.status(400).send({ message: "Error creating User" });
    }

    res.status(201).send({
      message: "user created successfully",
      user: {
        id: user._id,
        name,
        email,
        role,
      },
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const update = async (req, res) => {
  try {
    const { name, ident, email, cpf, password } = req.body;

    if (!name && !ident && !email && !cpf && !password) {
      res.status(400).send({ message: "Submit at least one field for update" });
    }

    const { id, user } = req;

    await userService.updateService(id, name, ident, email, cpf);

    res.send({ message: "User Successfully updated!" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const findAll = async (req, res) => {
  try {
    const users = await userService.findAllService();

    if (users.legth === 0) {
      return res.status(400).send({ message: "There are no regustred users" });
    }

    res.send(users);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const findById = async (req, res) => {
  try {
    const user = req.user;

    res.send(user);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const findUserRoleById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userService.findUserRoleByIdService(id);

    res.status(200).send({ role: user.role });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export default { create, findAll, findById, update, findUserRoleById, registerUser };
