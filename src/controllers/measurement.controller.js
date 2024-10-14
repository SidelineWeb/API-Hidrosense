import { createService, findAllService, findByHydrometerService} from "../services/measurement.service.js";
import Measurement from "../models/Measurement.js";
import Hydrometer from '../models/Hydrometer.js';
import moment from 'moment-timezone';
import mongoose from 'mongoose';


const calculateBilling = (totalMcubic) => {
    const tarifas = [
        { min: 0, max: 10, fixo: 35.85, variavel: 0 },
        { min: 11, max: 20, fixo: 0, variavel: 5.62 },
        { min: 21, max: 50, fixo: 0, variavel: 14.00 },
        { min: 51, max: Infinity, fixo: 0, variavel: 15.43 }
    ];

    let custo = totalMcubic > 0 ? tarifas[0].fixo : 0; // Inicia com o custo fixo mínimo

    tarifas.forEach((tarifa, index) => {
        if (totalMcubic > tarifa.min) {
            const consumoNessaFaixa = index === 0 ? tarifa.max : Math.min(totalMcubic - tarifa.min + 1, tarifa.max - tarifa.min);
            custo += consumoNessaFaixa * tarifa.variavel;
        }
    });

    return custo;
};

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

        // Buscar todas as medições do mês atual
        const measurements = await Measurement.find({
            timestamp: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
        });

        if (measurements.length === 0) {
            return res.status(400).send({ message: "No data available for this month" });
        }

        // Somar os valores de valueliters de todas as medições
        const totalLiters = measurements.reduce((sum, measurement) => sum + measurement.valueliters, 0);

        res.send({ totalLiters });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

const getCurentMonthMeasurementMcubic = async (req, res) => {
    try {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // Buscar todas as medições do mês atual
        const measurements = await Measurement.find({
            timestamp: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
        });

        if (measurements.length === 0) {
            return res.status(400).send({ message: "No data available for this month" });
        }

        // Somar os valores de valueMcubic de todas as medições
        const totalMcubic = measurements.reduce((sum, measurement) => sum + measurement.valueMcubic, 0);

        res.send({ totalMcubic });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

const getCurentMonthBilling = async (req, res) => {
    try {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // Buscar todas as medições do mês atual
        const measurements = await Measurement.find({
            timestamp: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
        });

        if (measurements.length === 0) {
            return res.status(400).send({ message: "No data available for this month" });
        }

        // Somar os valores de valueMcubic de todas as medições
        const totalMcubic = measurements.reduce((sum, measurement) => sum + measurement.valueMcubic, 0);

        // Calcular o valor da cobrança com base no consumo total em metros cúbicos
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

        // Obter todas as medições do mês até a data atual
        const measurements = await Measurement.find({
            timestamp: { $gte: firstDayOfMonth, $lt: now }
        });

        if (measurements.length === 0) {
            return res.status(400).send({ message: "No data available for this month" });
        }

        // Somar os valores de valueMcubic de todas as medições até a data atual
        const totalMcubic = measurements.reduce((sum, measurement) => sum + measurement.valueMcubic, 0);

        const currentDay = now.getDate();
        const totalDaysOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

        // Calcular a média diária e projetar o consumo para o mês inteiro
        const averageDailyConsumption = totalMcubic / currentDay;
        const projectedConsumption = averageDailyConsumption * totalDaysOfMonth;

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

// Info Charts - User 

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

// filtros - Medição User 

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

// Info Charts - Hydrometer 

const getCurrentMonthMeasurementLitersBySerial = async (req, res) => {
    try {
        const { serialNumber } = req.params; // Obtendo o serial number da requisição
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // Encontrar o hidrômetro pelo serial number
        const hydrometer = await Hydrometer.findOne({ serialNumber }).select('_id');
        if (!hydrometer) {
            return res.status(404).send({ message: "Hidrômetro não encontrado" });
        }

        // Consultar medições do hidrômetro no mês atual
        const totalLiters = await Measurement.aggregate([
            {
                $match: {
                    hydrometer: hydrometer._id,
                    timestamp: { $gte: firstDayOfMonth, $lt: lastDayOfMonth }
                }
            },
            {
                $group: {
                    _id: null,
                    totalLiters: { $sum: "$valueliters" }
                }
            }
        ]);

        res.send({ totalLiters: totalLiters[0]?.totalLiters || 0 });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

const getCurrentMonthMeasurementMcubicBySerial = async (req, res) => {
    try {
        const { serialNumber } = req.params; // Obtendo o serial number da requisição
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // Encontrar o hidrômetro pelo serial number
        const hydrometer = await Hydrometer.findOne({ serialNumber }).select('_id');
        if (!hydrometer) {
            return res.status(404).send({ message: "Hidrômetro não encontrado" });
        }

        // Consultar medições do hidrômetro no mês atual
        const totalMcubic = await Measurement.aggregate([
            {
                $match: {
                    hydrometer: hydrometer._id,
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

        res.send({ totalMcubic: totalMcubic[0]?.totalMcubic || 0 });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

const getCurentMonthBillingBySerial = async (req, res) => { 
    try {
        const serialNumber = req.params.serialNumber; // Obtém o serialNumber do hidrômetro a partir dos parâmetros da URL
        const hydrometer = await Hydrometer.findOne({ serialNumber });

        if (!hydrometer) {
            return res.status(404).send({ message: "Hydrometer not found" });
        }

        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // Busca as medições relacionadas ao hidrômetro
        const measurements = await Measurement.find({
            hydrometer: hydrometer._id, // Associar as medições ao hidrômetro
            timestamp: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
        }).sort({ timestamp: 1 }); // Ordenando do mais antigo para o mais recente

        if (measurements.length < 2) {
            return res.status(400).send({ message: "Not enough data to calculate consumption" });
        }

        // Pegando a primeira e a última medição do mês
        const firstMeasurement = measurements[0].valueMcubic;
        const lastMeasurement = measurements[measurements.length - 1].valueMcubic;

        const totalMcubic = lastMeasurement - firstMeasurement;
        const billingAmount = calculateBilling(totalMcubic); // Função que você usa para calcular a cobrança

        res.send({ totalMcubic, billingAmount });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

const getCurentMonthPrevBySerial = async (req, res) => { 
    try {
        const serialNumber = req.params.serialNumber; // Obtém o serialNumber do hidrômetro a partir dos parâmetros da URL
        const hydrometer = await Hydrometer.findOne({ serialNumber });

        if (!hydrometer) {
            return res.status(404).send({ message: "Hydrometer not found" });
        }

        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Obter todas as medições do mês até a data atual
        const measurements = await Measurement.find({
            hydrometer: hydrometer._id, // Associar as medições ao hidrômetro
            timestamp: { $gte: firstDayOfMonth, $lt: now }
        }).sort({ timestamp: 1 }); // Ordenando do mais antigo para o mais recente

        if (measurements.length < 2) {
            return res.status(400).send({ message: "Not enough data to calculate consumption" });
        }

        // Pegando a primeira e a última medição até a data atual
        const firstMeasurement = measurements[0].valueMcubic;
        const lastMeasurement = measurements[measurements.length - 1].valueMcubic;

        // Calculando o consumo total até agora
        const totalMcubic = lastMeasurement - firstMeasurement;
        const currentDay = now.getDate();
        const totalDaysOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

        // Calculando a média diária e a projeção para o mês inteiro
        const averageDailyConsumption = totalMcubic / currentDay;
        const projectedConsumption = averageDailyConsumption * totalDaysOfMonth;

        res.send({
            averageDailyConsumption,
            projectedConsumption
        });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// Controlador para obter o total de litros do hidrômetro
const getCurrentMonthMeasurementLitersByHydrometer = async (req, res) => {
    try {
        const hydrometerId = req.params.hydrometerId; // Obtém o ID do hidrômetro da rota
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // Converte o hydrometerId para ObjectId
        const objectIdHydrometer = new mongoose.Types.ObjectId(hydrometerId);

        // Busca o total de litros para o hidrômetro específico dentro do mês atual
        const totalLiters = await Measurement.aggregate([
            {
                $match: {
                    hydrometer: objectIdHydrometer, // Passa o ObjectId aqui
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

// Controlador para obter o total de metros cúbicos do hidrômetro
const getCurrentMonthMeasurementMcubicByHydrometer = async (req, res) => {
    try {
        const hydrometerId = req.params.hydrometerId; // Obtém o ID do hidrômetro da rota
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // Converte o hydrometerId para ObjectId
        const objectIdHydrometer = new mongoose.Types.ObjectId(hydrometerId);

        // Busca o total de metros cúbicos para o hidrômetro específico dentro do mês atual
        const totalMcubic = await Measurement.aggregate([
            {
                $match: {
                    hydrometer: objectIdHydrometer, // Passa o ObjectId aqui
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



// filtros - Measurement User

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

    getCurrentMonthMeasurementLitersBySerial, getCurrentMonthMeasurementMcubicBySerial, getCurentMonthBillingBySerial, getCurentMonthPrevBySerial,
    getCurrentMonthMeasurementMcubicByHydrometer, getCurrentMonthMeasurementLitersByHydrometer

};
