// seedMeasurements.js
import mongoose from "mongoose";
import Measurement from "../src/models/Measurement.js";
import dotenv from "dotenv";

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("Conexão com MongoDB estabelecida."))
  .catch(err => console.error("Erro ao conectar ao MongoDB:", err));

async function seedMeasurements() {
  try {
    console.log('Iniciando limpeza da coleção Measurement...');
    await Measurement.deleteMany({});
    console.log('Coleção Measurement limpa.');

    const numMeasurements = 50; // Número de medidas a criar
    let date = new Date('2023-10-20'); // Data de início
    let pulses = 10, valueMcubic = 5, valueliters = 5000; // Valores iniciais

    for (let i = 0; i < numMeasurements; i++) {
      const data = { 
        hydrometer: '6548170aeb78f9796f2715f0', 
        pulses: pulses, 
        valueMcubic: valueMcubic, 
        valueliters: valueliters, 
        timestamp: new Date(date)
      };

      console.log('Inserindo:', data);
      const measurement = new Measurement(data);
      await measurement.save();
      console.log('Dado inserido:', data);

      // Incrementando valores e data
      pulses += 1;
      valueMcubic += 0.5;
      valueliters += 100;
      date.setDate(date.getDate() + 1); // Avança um dia
    }

    console.log('Seeding complete!');
  } catch (err) {
    console.error('Erro durante o seeding:', err);
  } finally {
    mongoose.disconnect();
    console.log('Desconectado do MongoDB.');
  }
}

seedMeasurements();
