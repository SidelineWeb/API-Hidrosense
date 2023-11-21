import { createService, findAllService} from "../services/measurement.service.js";
import Measurement from "../models/Measurement.js";
import moment from 'moment-timezone';

//CRUD

const create = async (req, res) => {
    try {
      const { hydrometer, pulses, valueMcubic, valueliters, timestamp } = req.body;
  
      if (!hydrometer || !pulses || !valueMcubic || !valueliters || !timestamp) {
        res.status(400).send({ message: "Submit all fields to register measurement"})
      } else {
        // Convertendo o timestamp UNIX para o formato ISO 8601 no fuso horário específico
        // Substitua 'America/Sao_Paulo' pelo seu fuso horário
        const date = moment.unix(timestamp).tz('America/Sao_Paulo').format();
  
        await createService({
            hydrometer,
            pulses,
            valueMcubic,
            valueliters,
            timestamp: date // Usando a data convertida
        })
  
        res.status(201).send({
            message: "Medição criada com sucesso",
        });
      }
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
  };

const findAll = async (req, res) => { 
    try {
        const measurements = await findAllService();
    
        if (measurements.length === 0) {
          return res.status(400).send({ message: "There are no regustred users" });
        }
    
        res.send(measurements);
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

        res.send({findHydrometers});
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

        console.log('First day of month:', firstDayOfMonth);
        console.log('Last day of month:', lastDayOfMonth);

        const totalLiters = await Measurement.aggregate([
            {
                $match: {
                    timestamp: { $gte: firstDayOfMonth, $lt: lastDayOfMonth }
                }
            },
            {
                $group: {
                    _id: null,
                    totaliters: { $sum: "$valueliters" }
                }
            }
        ]);

        console.log('Total Liters:', totalLiters);

        res.send({ totalLiters });
    } catch (err) {
        console.error('Error:', err);
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

const getCurentMonthBilling = async (req, res) => { 
    try {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const totalMcubicData = await Measurement.aggregate([
            {
                $match: {
                    timestamp: { $gte: firstDayOfMonth, $lt: lastDayOfMonth }
                }
            },
            {
                $group: {
                    _id: null,
                    totalMcubic: { $sum: "$valueMcubic" }
                }
            }
        ]);

        const totalMcubic = totalMcubicData[0]?.totalMcubic || 0;
        const billingAmount = calculateBilling(totalMcubic);

        res.send({ totalMcubic, billingAmount });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

const getCurentMonthPrev = async (req, res) => { 
    try {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const currentDay = now.getDate();
        const totalDaysOfMonth = lastDayOfMonth.getDate();

        const totalMcubicData = await Measurement.aggregate([
            {
                $match: {
                    timestamp: { $gte: firstDayOfMonth, $lt: now } // Apenas considerando até o dia atual
                }
            },
            {
                $group: {
                    _id: null,
                    totalMcubic: { $sum: "$valueMcubic" }
                }
            }
        ]);

        const totalMcubic = totalMcubicData[0]?.totalMcubic || 0;
        const averageDailyConsumption = totalMcubic / currentDay; // Média de consumo por dia
        const projectedConsumption = averageDailyConsumption * totalDaysOfMonth; // Projeção para o mês inteiro

        res.send({
            averageDailyConsumption,
            projectedConsumption
        });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

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

const getCurrentYearLiters = async (req, res) => { 
    try {

        const currentYear = new Date().getFullYear(); // Obtendo o ano atual

        const firstDayOfYear = new Date(currentYear, 0, 1);
        const lastDayOfYear = new Date(currentYear, 11, 31);

        const totalLitersPerMonth = await Measurement.aggregate([
            {
                $match: {
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

const getCustomYearLiters = async (req, res) => { 
    try {
        const { year } = req.query; // Recebendo o ano dos parâmetros da requisição

        // Validação básica para o ano
        if (!year) {
            return res.status(400).send({ message: "Year is required" });
        }

        const firstDayOfYear = new Date(year, 0, 1);
        const lastDayOfYear = new Date(year, 11, 31);

        const totalLitersPerMonth = await Measurement.aggregate([
            {
                $match: {
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

const geCurrentDayLiters = async (req, res) => { 
    try {
        // Obtendo o dia atual
        const selectedDate = new Date();
        selectedDate.setHours(0, 0, 0, 0); // Configurando para o início do dia
        const nextDay = new Date(selectedDate);
        nextDay.setDate(selectedDate.getDate() + 1);

        const totalLitersPerHour = await Measurement.aggregate([
            {
                $match: {
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

const geCustomDayLiters = async (req, res) => { 
    try {
        const { date } = req.query; // Recebendo a data dos parâmetros da requisição

        // Validação básica para a data
        if (!date) {
            return res.status(400).send({ message: "Date is required" });
        }

        const selectedDate = new Date(date);
        const nextDay = new Date(selectedDate);
        nextDay.setDate(selectedDate.getDate() + 1);

        const totalLitersPerHour = await Measurement.aggregate([
            {
                $match: {
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

const getCurrentWeekLiters = async (req, res) => { 
    try {
        // Calculando as datas de início e fim da semana atual
        const today = new Date();
        const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
        const lastDayOfWeek = new Date(firstDayOfWeek);
        lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);

        const totalMcubicPerDay = await Measurement.aggregate([
            {
                $match: {
                    timestamp: { $gte: firstDayOfWeek, $lte: lastDayOfWeek }
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

        res.send({ totalMcubicPerDay });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

const getCustomWeekLiters = async (req, res) => { 
    try {
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

        const totalLitersPerDay = await Measurement.aggregate([
            {
                $match: {
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

const getCurrentMonthMcubic = async (req, res) => { 
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

const getCustomMonthMcubic = async (req, res) => { 
    try {
        const { year, month } = req.query; // Obtendo ano e mês dos parâmetros da requisição

        // Validação básica para ano e mês
        if (!year || !month) {
            return res.status(400).send({ message: "Year and month are required" });
        }

        const firstDayOfMonth = new Date(year, month - 1, 1); // Mês no JavaScript começa do 0
        const lastDayOfMonth = new Date(year, month, 0);

        const totalMcubicPerDay = await Measurement.aggregate([
            {
                $match: {
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

        res.send({ totalMcubicPerDay });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

const getCurrentYearMcubic = async (req, res) => { 
    try {
        const currentYear = new Date().getFullYear(); // Obtendo o ano atual
        const firstDayOfYear = new Date(currentYear, 0, 1);
        const lastDayOfYear = new Date(currentYear, 11, 31);

        const totalMcubicPerMonth = await Measurement.aggregate([
            {
                $match: {
                    timestamp: { $gte: firstDayOfYear, $lte: lastDayOfYear }
                }
            },
            {
                $group: {
                    _id: { $month: "$timestamp" },
                    totalMcubic: { $sum: "$valueMcubic" }
                }
            },
            {
                $sort: { "_id": 1 } // Ordenando por mês
            }
        ]);

        res.send({ totalMcubicPerMonth });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

const getCustomYearMcubic = async (req, res) => { 
    try {
        const { year } = req.query; // Recebendo o ano dos parâmetros da requisição

        // Validação básica para o ano
        if (!year) {
            return res.status(400).send({ message: "Year is required" });
        }

        const firstDayOfYear = new Date(year, 0, 1);
        const lastDayOfYear = new Date(year, 11, 31);

        const totalLitersPerMonth = await Measurement.aggregate([
            {
                $match: {
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

const getCurrentDayMcubic = async (req, res) => { 
    try {
        // Obtendo o dia atual
        const selectedDate = new Date();
        selectedDate.setHours(0, 0, 0, 0); // Configurando para o início do dia
        const nextDay = new Date(selectedDate);
        nextDay.setDate(selectedDate.getDate() + 1);

        const totalMcubicPerHour = await Measurement.aggregate([
            {
                $match: {
                    timestamp: { $gte: selectedDate, $lt: nextDay }
                }
            },
            {
                $group: {
                    _id: { $hour: "$timestamp" },
                    totalMcubic: { $sum: "$valueMcubic" }
                }
            },
            {
                $sort: { "_id": 1 } // Ordenando por hora
            }
        ]);

        res.send({ totalMcubicPerHour });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

const getCustomDayMcubic = async (req, res) => { 
    try {
        const { date } = req.query; // Recebendo a data dos parâmetros da requisição

        // Validação básica para a data
        if (!date) {
            return res.status(400).send({ message: "Date is required" });
        }

        const selectedDate = new Date(date);
        const nextDay = new Date(selectedDate);
        nextDay.setDate(selectedDate.getDate() + 1);

        const totalLitersPerHour = await Measurement.aggregate([
            {
                $match: {
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

const getCurrentWeekMcubic = async (req, res) => { 
    try {
        // Calculando as datas de início e fim da semana atual
        const today = new Date();
        const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
        const lastDayOfWeek = new Date(firstDayOfWeek);
        lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);

        const totalMcubicPerDay = await Measurement.aggregate([
            {
                $match: {
                    timestamp: { $gte: firstDayOfWeek, $lte: lastDayOfWeek }
                }
            },
            {
                $group: {
                    _id: { $dayOfWeek: "$timestamp" },
                    totalMcubic: { $sum: "$valueMcubic" }
                }
            },
            {
                $sort: { "_id": 1 } // Ordenando pelos dias da semana
            }
        ]);

        res.send({ totalMcubicPerDay });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

const getCustomWeekMcubic = async (req, res) => { 
    try {
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

        const totalLitersPerDay = await Measurement.aggregate([
            {
                $match: {
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

// Info Charts - User por Hydrometer

const getCurentMonthMeasurementLitersByUser = async (req, res) => {
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

const getCurentMonthMeasurementMcubicByUser = async (req, res) => { 
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

const getCurentMonthBillingByUser = async (req, res) => { 

};

const getCurentMonthPrevByUser = async (req, res) => { };

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

const getCurrentWeekLitersByUser = async (req, res) => {
        try {
            const userId = req.user.id; // ID do usuário do token JWT
    
            // Calculando as datas de início e fim da semana atual
            const today = new Date();
            const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
            const lastDayOfWeek = new Date(firstDayOfWeek);
            lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
    
            // Encontrando todos os hidrômetros associados a esse usuário
            const userHydrometers = await Hydrometer.find({ user: userId }).select('_id');
    
            const totalLitersPerDay = await Measurement.aggregate([
                {
                    $match: {
                        hydrometer: { $in: userHydrometers.map(h => h._id) },
                        timestamp: { $gte: firstDayOfWeek, $lte: lastDayOfWeek }
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

const getCurrentMonthMcubicByUser = async (req, res) => {
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

        const totalMcubicPerDay = await Measurement.aggregate([
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

        res.send({ totalMcubicPerDay });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

const getCurrentYearMcubicByUser = async (req, res) => {
    try {
        const userId = req.user.id; // ID do usuário do token JWT

        const currentYear = new Date().getFullYear(); // Obtendo o ano atual

        const firstDayOfYear = new Date(currentYear, 0, 1);
        const lastDayOfYear = new Date(currentYear, 11, 31);

        // Encontrando todos os hidrômetros associados a esse usuário
        const userHydrometers = await Hydrometer.find({ user: userId }).select('_id');

        const totalMcubicPerMonth = await Measurement.aggregate([
            {
                $match: {
                    hydrometer: { $in: userHydrometers.map(h => h._id) },
                    timestamp: { $gte: firstDayOfYear, $lte: lastDayOfYear }
                }
            },
            {
                $group: {
                    _id: { $month: "$timestamp" },
                    totalMcubic: { $sum: "$valueMcubic" }
                }
            },
            {
                $sort: { "_id": 1 } // Ordenando por mês
            }
        ]);

        res.send({ totalMcubicPerMonth });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
 };

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

const getCurrentDayMcubicByUser = async (req, res) => { 
    try {
        const userId = req.user.id; // ID do usuário do token JWT

        // Obtendo o dia atual
        const selectedDate = new Date();
        selectedDate.setHours(0, 0, 0, 0); // Configurando para o início do dia
        const nextDay = new Date(selectedDate);
        nextDay.setDate(selectedDate.getDate() + 1);

        // Encontrando todos os hidrômetros associados a esse usuário
        const userHydrometers = await Hydrometer.find({ user: userId }).select('_id');

        const totalMcubicPerHour = await Measurement.aggregate([
            {
                $match: {
                    hydrometer: { $in: userHydrometers.map(h => h._id) },
                    timestamp: { $gte: selectedDate, $lt: nextDay }
                }
            },
            {
                $group: {
                    _id: { $hour: "$timestamp" },
                    totalMcubic: { $sum: "$valueMcubic" }
                }
            },
            {
                $sort: { "_id": 1 } // Ordenando por hora
            }
        ]);

        res.send({ totalMcubicPerHour });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

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

const getCurrentWeekMcubicByUser = async (req, res) => { 
    try {
        const userId = req.user.id; // ID do usuário do token JWT

        // Calculando as datas de início e fim da semana atual
        const today = new Date();
        const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
        const lastDayOfWeek = new Date(firstDayOfWeek);
        lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);

        // Encontrando todos os hidrômetros associados a esse usuário
        const userHydrometers = await Hydrometer.find({ user: userId }).select('_id');

        const totalMcubicPerDay = await Measurement.aggregate([
            {
                $match: {
                    hydrometer: { $in: userHydrometers.map(h => h._id) },
                    timestamp: { $gte: firstDayOfWeek, $lte: lastDayOfWeek }
                }
            },
            {
                $group: {
                    _id: { $dayOfWeek: "$timestamp" },
                    totalMcubic: { $sum: "$valueMcubic" }
                }
            },
            {
                $sort: { "_id": 1 } // Ordenando pelos dias da semana
            }
        ]);

        res.send({ totalMcubicPerDay });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

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

    getCurentMonthMeasurementLitersByUser, getCurentMonthMeasurementMcubicByUser, getCurentMonthBillingByUser, getCurentMonthPrevByUser,

    getCurrentMonthLitersByUser, getCustomMonthLitersByUser, getCurrentYearLitersByUser,
    getCustomYearLitersByUser, geCurrentDayLitersByUser, geCustomDayLitersByUser,
    getCurrentWeekLitersByUser, getCustomWeekLitersByUser, getCurrentMonthMcubicByUser,
    getCustomMonthMcubicByUser, getCurrentYearMcubicByUser, getCustomYearMcubicByUser,
    getCurrentDayMcubicByUser, getCustomDayMcubicByUser, getCurrentWeekMcubicByUser,
    getCustomWeekMcubicByUser,

};
