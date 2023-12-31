import { createService, findAllService, findValveStateByIdService, updateService, findByUserService, deleteService, findByIdService } from "../services/hydrometer.service.js";

const create = async (req, res) => {
    try {
        const { location, model, serialNumber } = req.body;
    
        if (!location || !model || !serialNumber) {
          res.status(400).send({ message: "Submit all fields to register hydrometer" });
        }
    
        await createService({
            location,
            model,
            serialNumber,
            user: { _id: "65468e202145bd27a81b006f"},
           
        })
    
        res.status(201).send({
          message: "hydrometer created successfully",
          
        });
      } catch (err) {
        res.status(500).send({ message: err.message });
      }
};

const findAll = async (req, res) => {
    try {
        const hydrometers = await findAllService();
    
        if (hydrometers.legth === 0) {
          return res.status(400).send({ message: "There are no regustred users" });
        }
    
        res.send(hydrometers);
      } catch (err) {
        res.status(500).send({ message: err.message });
      }
};

const findById = async (req, res) => {
  try {
    const { id } = req.params; // Obter o ID da URL
    const hydrometer = await findByIdService(id);

    res.status(200).send(hydrometer);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const findByUser = async (req, res) => {
  try {
      const userId = req.params.userId; // ou req.user.id se você estiver usando autenticação
      const hydrometers = await findByUserService(userId);

      if (!hydrometers.length) {
          return res.status(404).send({ message: "Nenhum hidrômetro encontrado para este usuário." });
      }

      res.send(hydrometers);
  } catch (err) {
      res.status(500).send({ message: err.message });
  }
};

const valveStatus = async (req, res) => {
  try {
      const { id } = req.params;
      const hydrometer = await findValveStateByIdService(id);

      res.send({ valveState: hydrometer.valveState });
  } catch (err) {
      res.status(500).send({ message: err.message });
  }
};

const deleteHydrometer = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteService(id);
    res.status(200).json({ message: 'Hydrometer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const update = async (req, res) => {
    const { id } = req.params; // Obter o ID da URL
    const updateData = req.body;

    try {
        // Verificar se pelo menos um campo foi fornecido para atualização
        if (Object.keys(updateData).length === 0) {
          return res.status(400).send({ message: "Envie pelo menos um campo para atualização" });
        }

        // Atualizar o hidrômetro
        const updatedHydrometer = await updateService(id, updateData);

        res.send({ message: "Hydrometer successfully updated", updatedHydrometer });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

const toggleValveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    // Encontrar o hidrômetro e alternar o estado da válvula
    const hydrometer = await findByIdService(id);
    
    const updatedValveState = !hydrometer.valveState;
    const updatedHydrometer = await updateService(id, { valveState: updatedValveState });

    res.status(200).send({ message: "Estado da válvula atualizado com sucesso", valveState: updatedHydrometer.valveState });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export default { create, findAll, findById, findByUser, update, valveStatus, deleteHydrometer,toggleValveStatus };
