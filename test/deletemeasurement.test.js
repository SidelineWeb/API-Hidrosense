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
    //console.log('Iniciando limpeza da coleção Measurement...');
    await Measurement.deleteMany({});
    console.log('Coleção Measurement limpa.');

    console.log('Seeding complete!');
  } catch (err) {
    console.error('Erro durante o seeding:', err);
  } finally {
    mongoose.disconnect();
    console.log('Desconectado do MongoDB.');
  }
}

seedMeasurements();
