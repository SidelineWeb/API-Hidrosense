import { createService, findAllService } from "../services/valve.service.js";

const create = async (req, res) => {
    try {
        const { location, model, serialNumber } = req.body;
    
        if (!hydrometer || !opened || !date) {
          res.status(400).send({ message: "Submit all fields to register hydrometer" });
        }
    
        await createService({
            hydrometer,
            moopeneddel,
            date,
           
        })
    
        res.status(201).send({
          message: "valve created successfully",
          
        });
      } catch (err) {
        res.status(500).send({ message: err.message });
      }
};

const findAll = async (req, res) => {
    try {
        const valve = await findAllService();
    
        if (valve.legth === 0) {
          return res.status(400).send({ message: "There are no registered valves" });
        }
    
        res.send(valve);
      } catch (err) {
        res.status(500).send({ message: err.message });
      }
};

const findById = async (req, res) => {
  try {
    const { id } = req.params; // Obter o ID da URL
    const valve = await findByIdService(id);

    res.status(200).send(valve);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};


export default { create, findAll, findById,};
