// seedMeasurements.js
import mongoose from "mongoose";
import Measurement from "../src/models/Measurement.js";
import dotenv from "dotenv";

dotenv.config({ path: '../.env' });

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("Conexão com MongoDB estabelecida."))
  .catch(err => console.error("Erro ao conectar ao MongoDB:", err));

async function seedMeasurements() {
  try {

    const numMeasurements = 21; // Número de medidas a criar
    let date = new Date('2024-9-22'); // Data de início
    let pulses = 1, valueMcubic = 0.001, valueliters = 1; // Valores iniciais

    for (let i = 0; i < numMeasurements; i++) {
      const data = { 
        hydrometer: '67038ab1133085321d241f87', 
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
      pulses = 1;
      valueMcubic = 0.001;
      valueliters = 1;
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
