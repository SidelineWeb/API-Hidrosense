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

// filtros - Medição Geral

const getCurrentMonthLiters = async (req, res) => {
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

 const getCustomMonthLiters = async (req, res) => { 
    try {
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

const getCurrentYearLiters = async (req, res) => { };

const getCustomYearLiters = async (req, res) => { };

const geCurrentDayLiters = async (req, res) => { };

const geCustomDayLiters = async (req, res) => { };

const getCurrentWeekLiters = async (req, res) => { };

const getCustomWeekLiters = async (req, res) => { };

const getCurrentMonthMcubic = async (req, res) => { };

const getCustomMonthMcubic = async (req, res) => { };

const getCurrentYearMcubic = async (req, res) => { };

const getCustomYearMcubic = async (req, res) => { };

const getCurrentDayMcubic = async (req, res) => { };

const getCustomDayMcubic = async (req, res) => { };

const getCurrentWeekMcubic = async (req, res) => { };

const getCustomWeekMcubic = async (req, res) => { };

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

const getCustomMonthLitersByUser = async (req, res) => { 
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

const getCurrentYearLitersByUser = async (req, res) => { 
    try {
        const userId = req.user.id; // ID do usuário do token JWT

        const currentYear = new Date().getFullYear(); // Obtendo o ano atual

        const firstDayOfYear = new Date(currentYear, 0, 1);
        const lastDayOfYear = new Date(currentYear, 11, 31);

        // Encontrando todos os hidrômetros associados a esse usuário
        const userHydrometers = await Hydrometer.find({ user: userId }).select('_id');

        const totalLitersPerMonth = await Measurement.aggregate([
            {
                $match: {
                    hydrometer: { $in: userHydrometers.map(h => h._id) },
                    timestamp: { $gte: firstDayOfYear, $lte: lastDayOfYear }
                }
            },
            {
                $group: {
                    _id: { $month: "$timestamp" },
                    totalLiters: { $sum: "$valueliters" }
                }
            },
            {
                $sort: { "_id": 1 } // Ordenando por mês
            }
        ]);

        res.send({ totalLitersPerMonth });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
 };

const getCustomYearLitersByUser = async (req, res) => { 
    try {
        const userId = req.user.id; // ID do usuário do token JWT
        const { year } = req.query; // Recebendo o ano dos parâmetros da requisição

        // Validação básica para o ano
        if (!year) {
            return res.status(400).send({ message: "Year is required" });
        }

        const firstDayOfYear = new Date(year, 0, 1);
        const lastDayOfYear = new Date(year, 11, 31);

        // Encontrando todos os hidrômetros associados a esse usuário
        const userHydrometers = await Hydrometer.find({ user: userId }).select('_id');

        const totalLitersPerMonth = await Measurement.aggregate([
            {
                $match: {
                    hydrometer: { $in: userHydrometers.map(h => h._id) },
                    timestamp: { $gte: firstDayOfYear, $lte: lastDayOfYear }
                }
            },
            {
                $group: {
                    _id: { $month: "$timestamp" },
                    totalLiters: { $sum: "$valueliters" }
                }
            },
            {
                $sort: { "_id": 1 } // Ordenando por mês
            }
        ]);

        res.send({ totalLitersPerMonth });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

const geCurrentDayLitersByUser = async (req, res) => { 
    try {
        const userId = req.user.id; // ID do usuário do token JWT

        // Obtendo o dia atual
        const selectedDate = new Date();
        selectedDate.setHours(0, 0, 0, 0); // Configurando para o início do dia
        const nextDay = new Date(selectedDate);
        nextDay.setDate(selectedDate.getDate() + 1);

        // Encontrando todos os hidrômetros associados a esse usuário
        const userHydrometers = await Hydrometer.find({ user: userId }).select('_id');

        const totalLitersPerHour = await Measurement.aggregate([
            {
                $match: {
                    hydrometer: { $in: userHydrometers.map(h => h._id) },
                    timestamp: { $gte: selectedDate, $lt: nextDay }
                }
            },
            {
                $group: {
                    _id: { $hour: "$timestamp" },
                    totalLiters: { $sum: "$valueliters" }
                }
            },
            {
                $sort: { "_id": 1 } // Ordenando por hora
            }
        ]);

        res.send({ totalLitersPerHour });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
 };

const geCustomDayLitersByUser = async (req, res) => { 
    try {
        const userId = req.user.id; // ID do usuário obtido do token JWT
        const { date } = req.query; // Recebendo a data dos parâmetros da requisição

        // Validação básica para a data
        if (!date) {
            return res.status(400).send({ message: "Date is required" });
        }

        const selectedDate = new Date(date);
        const nextDay = new Date(selectedDate);
        nextDay.setDate(selectedDate.getDate() + 1);

        // Encontrando todos os hidrômetros associados a esse usuário
        const userHydrometers = await Hydrometer.find({ user: userId }).select('_id');

        const totalLitersPerHour = await Measurement.aggregate([
            {
                $match: {
                    hydrometer: { $in: userHydrometers.map(h => h._id) },
                    timestamp: { $gte: selectedDate, $lt: nextDay }
                }
            },
            {
                $group: {
                    _id: { $hour: "$timestamp" },
                    totalLiters: { $sum: "$valueliters" }
                }
            },
            {
                $sort: { "_id": 1 } // Ordenando por hora
            }
        ]);

        res.send({ totalLitersPerHour });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
             
};

const getCurrentWeekLitersByUser = async (req, res) => { };

const getCustomWeekLitersByUser = async (req, res) => {
    try {
        const userId = req.user.id; // ID do usuário do token JWT
        const { date } = req.query; // Recebendo uma data da semana dos parâmetros da requisição

        // Validação básica para a data
        if (!date) {
            return res.status(400).send({ message: "Date is required" });
        }

        const selectedDate = new Date(date);
        // Ajustando para o início da semana (domingo), subtraindo o dia da semana
        const startOfWeek = new Date(selectedDate);
        startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());

        // Ajustando para o final da semana (sábado)
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        // Encontrando todos os hidrômetros associados a esse usuário
        const userHydrometers = await Hydrometer.find({ user: userId }).select('_id');

        const totalLitersPerDay = await Measurement.aggregate([
            {
                $match: {
                    hydrometer: { $in: userHydrometers.map(h => h._id) },
                    timestamp: { $gte: startOfWeek, $lte: endOfWeek }
                }
            },
            {
                $group: {
                    _id: { $dayOfWeek: "$timestamp" },
                    totalLiters: { $sum: "$valueliters" }
                }
            },
            {
                $sort: { "_id": 1 } // Ordenando pelos dias da semana
            }
        ]);

        res.send({ totalLitersPerDay });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
 };

const getCurrentMonthMcubicByUser = async (req, res) => { };

const getCustomMonthMcubicByUser = async (req, res) => { 
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
                    totalLiters: { $sum: "$valueMcubic" }
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

const getCurrentYearMcubicByUser = async (req, res) => { };

const getCustomYearMcubicByUser = async (req, res) => { 
    try {
        const userId = req.user.id; // ID do usuário do token JWT
        const { year } = req.query; // Recebendo o ano dos parâmetros da requisição

        // Validação básica para o ano
        if (!year) {
            return res.status(400).send({ message: "Year is required" });
        }

        const firstDayOfYear = new Date(year, 0, 1);
        const lastDayOfYear = new Date(year, 11, 31);

        // Encontrando todos os hidrômetros associados a esse usuário
        const userHydrometers = await Hydrometer.find({ user: userId }).select('_id');

        const totalLitersPerMonth = await Measurement.aggregate([
            {
                $match: {
                    hydrometer: { $in: userHydrometers.map(h => h._id) },
                    timestamp: { $gte: firstDayOfYear, $lte: lastDayOfYear }
                }
            },
            {
                $group: {
                    _id: { $month: "$timestamp" },
                    totalLiters: { $sum: "$valueMcubic" }
                }
            },
            {
                $sort: { "_id": 1 } // Ordenando por mês
            }
        ]);

        res.send({ totalLitersPerMonth });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

const getCurrentDayMcubicByUser = async (req, res) => { };

const getCustomDayMcubicByUser = async (req, res) => { 
    try {
        const userId = req.user.id; // ID do usuário obtido do token JWT
        const { date } = req.query; // Recebendo a data dos parâmetros da requisição

        // Validação básica para a data
        if (!date) {
            return res.status(400).send({ message: "Date is required" });
        }

        const selectedDate = new Date(date);
        const nextDay = new Date(selectedDate);
        nextDay.setDate(selectedDate.getDate() + 1);

        // Encontrando todos os hidrômetros associados a esse usuário
        const userHydrometers = await Hydrometer.find({ user: userId }).select('_id');

        const totalLitersPerHour = await Measurement.aggregate([
            {
                $match: {
                    hydrometer: { $in: userHydrometers.map(h => h._id) },
                    timestamp: { $gte: selectedDate, $lt: nextDay }
                }
            },
            {
                $group: {
                    _id: { $hour: "$timestamp" },
                    totalLiters: { $sum: "$valueMcubic" }
                }
            },
            {
                $sort: { "_id": 1 } // Ordenando por hora
            }
        ]);

        res.send({ totalLitersPerHour });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

const getCurrentWeekMcubicByUser = async (req, res) => { };

const getCustomWeekMcubicByUser = async (req, res) => { 
    try {
        const userId = req.user.id; // ID do usuário do token JWT
        const { date } = req.query; // Recebendo uma data da semana dos parâmetros da requisição

        // Validação básica para a data
        if (!date) {
            return res.status(400).send({ message: "Date is required" });
        }

        const selectedDate = new Date(date);
        // Ajustando para o início da semana (domingo), subtraindo o dia da semana
        const startOfWeek = new Date(selectedDate);
        startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());

        // Ajustando para o final da semana (sábado)
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        // Encontrando todos os hidrômetros associados a esse usuário
        const userHydrometers = await Hydrometer.find({ user: userId }).select('_id');

        const totalLitersPerDay = await Measurement.aggregate([
            {
                $match: {
                    hydrometer: { $in: userHydrometers.map(h => h._id) },
                    timestamp: { $gte: startOfWeek, $lte: endOfWeek }
                }
            },
            {
                $group: {
                    _id: { $dayOfWeek: "$timestamp" },
                    totalLiters: { $sum: "$valueMcubic" }
                }
            },
            {
                $sort: { "_id": 1 } // Ordenando pelos dias da semana
            }
        ]);

        res.send({ totalLitersPerDay });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

export default { 
    create, findAll, findByHydrometer,

    getCurentMonthMeasurementLiters, getCurentMonthMeasurementMcubic, getCurentMonthBilling, getCurentMonthPrev,

    getCurrentMonthLiters, getCustomMonthLiters, getCurrentYearLiters, getCustomYearLiters,
    geCurrentDayLiters, geCustomDayLiters, getCurrentWeekLiters, getCustomWeekLiters,
    getCurrentMonthMcubic, getCustomMonthMcubic, getCurrentYearMcubic, getCustomYearMcubic,
    getCurrentDayMcubic, getCustomDayMcubic, getCurrentWeekMcubic, getCustomWeekMcubic,

    getCurentMonthTotalLiters, getCurentMonthTotalMcubic, getCurentMonthTotalBilling, getCurentMonthTotalPrev,

    getCurrentMonthLitersByUser, getCustomMonthLitersByUser, getCurrentYearLitersByUser,
    getCustomYearLitersByUser, geCurrentDayLitersByUser, geCustomDayLitersByUser,
    getCurrentWeekLitersByUser, getCustomWeekLitersByUser, getCurrentMonthMcubicByUser,
    getCustomMonthMcubicByUser, getCurrentYearMcubicByUser, getCustomYearMcubicByUser,
    getCurrentDayMcubicByUser, getCustomDayMcubicByUser, getCurrentWeekMcubicByUser,
    getCustomWeekMcubicByUser,

};
