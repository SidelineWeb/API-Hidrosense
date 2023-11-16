import { createService, findAllService, findByIdService, updateService } from "../services/measurement.service.js";

//CRUD

const create = async (req, res) => { 
    try {
        const { hydrometer, pulses, valueMcubic, valueliters, timestamp } = req.body;

        if (!hydrometer || !pulses || !valueMcubic || !valueliters || !timestamp) {
            res.status(400).send({ message: "Submit all fields to register measurement"})
        } else {
            // Convertendo o timestamp UNIX para o formato ISO 8601
            const date = new Date(timestamp * 1000).toISOString();

            await createService({
                hydrometer,
                pulses,
                valueMcubic,
                valueliters,
                timestamp: date // Usando a data convertida
            })

            res.status(201).send({
                message: "medição criada com sucesso",
            });
        }
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

const findAll = async (req, res) => { 
    try {
        const hydrometers = await findAllService();
    
        if (hydrometers.length === 0) {
          return res.status(400).send({ message: "There are no regustred users" });
        }
    
        res.send(hydrometers);
      } catch (err) {
        res.status(500).send({ message: err.message });
      }
};

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

const getMonthMeasurement = async (req, res) => {
    try {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const totalLitersPerDay = await Measurement.aggregate([
            {
                $match: {
                    timestamp: { $gte: firstDayOfMonth, $lt: lastDayOfMonth }
                }
            },
            {
                $group: {
                    _id: { $dayOfMonth: "$timestamp" },
                    totalLiters: { $sum: "$valueliters" }
                }
            },
            {
                $sort: { "_id": 1 } // Ordenando por dia do mês
            }
        ]);

        res.send({ totalLitersPerDay });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
 };

const getYearMeasurement = async (req, res) => { };

const getDayMeasurement = async (req, res) => { };

const getWeekMeasurement = async (req, res) => { };

// Info Charts 

const getCurentMonthMeasurementLiters = async (req, res) => {
    try {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const totalLiters = await Measurement.aggregate([
            {
                $match: {
                    timestamp: { $gte: firstDayOfMonth, $lt: lastDayOfMonth }
                }
            },
            {
                $group: {
                    _id: null, // Agrupar todos os documentos juntos
                    totalLiters: { $sum: "$valueliters" }
                }
            }
        ]);

        res.send({ totalLiters: totalLiters[0]?.totalLiters || 0 });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
 };

const getCurentMonthMeasurementMcubic = async (req, res) => {
    try {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const totalMcubic = await Measurement.aggregate([
            {
                $match: {
                    timestamp: { $gte: firstDayOfMonth, $lt: lastDayOfMonth }
                }
            },
            {
                $group: {
                    _id: null, // Agrupar todos os documentos juntos
                    totalMcubic: { $sum: "$valueMcubic" }
                }
            }
        ]);

        res.send({ totalMcubic: totalMcubic[0]?.totalMcubic || 0 });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
 };

const getCurentMonthBilling = async (req, res) => { };

const getCurentMonthPrev = async (req, res) => { };

// Info Charts - User por Hydrometer

const getCurentMonthTotalLiters = async (req, res) => {
    try {
        const userId = req.user.id; // Obtendo o ID do usuário do token JWT
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // Primeiro, encontre todos os hidrômetros associados a esse usuário
        const userHydrometers = await Hydrometer.find({ user: userId }).select('_id');

        const totalLiters = await Measurement.aggregate([
            {
                $match: {
                    hydrometer: { $in: userHydrometers.map(h => h._id) },
                    timestamp: { $gte: firstDayOfMonth, $lt: lastDayOfMonth }
                }
            },
            {
                $group: {
                    _id: null, // Agrupar todos os documentos juntos
                    totalLiters: { $sum: "$valueliters" }
                }
            }
        ]);

        res.send({ totalLiters: totalLiters[0]?.totalLiters || 0 });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
 };

const getCurentMonthTotalMcubic = async (req, res) => { 
    try {
        const userId = req.user.id; // Obtendo o ID do usuário do token JWT
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // Primeiro, encontre todos os hidrômetros associados a esse usuário
        const userHydrometers = await Hydrometer.find({ user: userId }).select('_id');

        const totalMcubic = await Measurement.aggregate([
            {
                $match: {
                    hydrometer: { $in: userHydrometers.map(h => h._id) },
                    timestamp: { $gte: firstDayOfMonth, $lt: lastDayOfMonth }
                }
            },
            {
                $group: {
                    _id: null, // Agrupar todos os documentos juntos
                    totalMcubic: { $sum: "$valueMcubic" }
                }
            }
        ]);

        res.send({ totalMcubic: totalMcubic[0]?.totalMcubic || 0 });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
 };

const getCurentMonthTotalBilling = async (req, res) => { };

const getCurentMonthTotalPrev = async (req, res) => { };

// filtros - Medição User por Hydrometer

const getCurrentMonthLitersByUser = async (req, res) => { 
    try {
        const userId = req.user.id; // ID do usuário obtido do token JWT
        const { year, month } = req.query; // Obtendo ano e mês dos parâmetros da requisição

        // Validação básica para ano e mês
        if (!year || !month) {
            return res.status(400).send({ message: "Year and month are required" });
        }

        const firstDayOfMonth = new Date(year, month - 1, 1); // Mês no JavaScript começa do 0
        const lastDayOfMonth = new Date(year, month, 0);

        // Encontrando todos os hidrômetros associados a esse usuário
        const userHydrometers = await Hydrometer.find({ user: userId }).select('_id');

        const totalLitersPerDay = await Measurement.aggregate([
            {
                $match: {
                    hydrometer: { $in: userHydrometers.map(h => h._id) },
                    timestamp: { $gte: firstDayOfMonth, $lt: lastDayOfMonth }
                }
            },
            {
                $group: {
                    _id: { $dayOfMonth: "$timestamp" },
                    totalLiters: { $sum: "$valueliters" }
                }
            },
            {
                $sort: { "_id": 1 } // Ordenando por dia do mês
            }
        ]);

        res.send({ totalLitersPerDay });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

const getCustomMonthLitersByUser = async (req, res) => { 
    try {
        const userId = req.user.id; // Obtendo o ID do usuário do token JWT
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // Primeiro, encontre todos os hidrômetros associados a esse usuário
        const userHydrometers = await Hydrometer.find({ user: userId }).select('_id');

        const totalLiters = await Measurement.aggregate([
            {
                $match: {
                    hydrometer: { $in: userHydrometers.map(h => h._id) },
                    timestamp: { $gte: firstDayOfMonth, $lt: lastDayOfMonth }
                }
            },
            {
                $group: {
                    _id: null, // Agrupar todos os documentos juntos
                    totalLiters: { $sum: "$valueliters" }
                }
            }
        ]);

        res.send({ totalLiters: totalLiters[0]?.totalLiters || 0 });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

const getCurrentYearLitersByUser = async (req, res) => { };

const getCustomYearLitersByUser = async (req, res) => { };

const geCurrentDayLitersByUser = async (req, res) => { };

const geCustomDayLitersByUser = async (req, res) => { };

const getCurrentWeekLitersByUser = async (req, res) => { };

const getCustomWeekLitersByUser = async (req, res) => { };

const getCurrentMonthMcubicByUser = async (req, res) => { };

const getCustomMonthMcubicByUser = async (req, res) => { };

const getCurrentYearMcubicByUser = async (req, res) => { };

const getCustomYearMcubicByUser = async (req, res) => { };

const getCurrentDayMcubicByUser = async (req, res) => { };

const getCustomDayMcubicByUser = async (req, res) => { };

const getCurrentWeekMcubicByUser = async (req, res) => { };

const getCustomWeekMcubicByUser = async (req, res) => { };

export default { 
    create, findAll, findByHydrometer, 

    getMonthMeasurement, getYearMeasurement, getDayMeasurement, getWeekMeasurement,

    getCurentMonthMeasurementLiters, getCurentMonthMeasurementMcubic, getCurentMonthBilling, getCurentMonthPrev,

    getCurentMonthTotalLiters, getCurentMonthTotalMcubic, getCurentMonthTotalBilling, getCurentMonthTotalPrev,

};
