import { createService, findAllService, findByIdService, updateService } from "../services/measurement.service.js";

const create = async (req, res) => { 
    try{
        const { hydrometer, pulses, valueMcubic, valueliters, time, date, timestamp } = req.boby;

        if (!hydrometer || !pulses || !valueMcubic || !valueliters || !time || !date || !timestamp) {
            res.status(400).send({ message: "Submit all fields to register measurement"})
        }

        await createService({
            hydrometer,
            pulses,
            valueMcubic,
            valueliters,
            time,
            date,
            timestamp
        })

        res.status(201).send({
            message: "medição criada com sucesso",
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

const findById = async (req, res) => { };

const findByUser = async (req, res) => { };

const findByHydrometer = async (req, res) => { 
    try {
        const HydrometerId = req.params.hydrometerId;
        const findHydrometers = await findByHydrometer(HydrometerId);

        if (!findHydrometers.legth) {
            return res.status(404).send({ message: "Nenhum hidrômetro encontrado"});
        }
        res.send(findHydrometers);
    } catch (err){
        res.status(500).send({ message:err.message });
    }
};

// filtros - Medição Geral

const getMonthMeasurement = async (req, res) => { };

const getYearMeasurement = async (req, res) => { };

const getDayMeasurement = async (req, res) => { };

const getWeekMeasurement = async (req, res) => { };

// filtros - Medição por user

const getMonthMeasurementByUser = async (req, res) => { };

const getYearMeasurementByUser = async (req, res) => { };

const getDayMeasurementByUser = async (req, res) => { };

const getWeekMeasurementByUser = async (req, res) => { };


export { create, findAll, findById, findByUser, findByHydrometer, getMonthMeasurement, getYearMeasurement, getDayMeasurement, getWeekMeasurement};
