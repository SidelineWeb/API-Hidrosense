import mongoose from "mongoose";

const HydrometerSchema = new mongoose.Schema({
  location: {
    type: String,
    required: true,
  },
  model: {
    type: String,
    required: true,
  },
  serialNumber: {
    type: String,
    required: true,
    unique: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  valveState: {
    type: Boolean,
    required: true,
    default: false, // falso para aberta, Verdadeiro para fechada
  },
  // Você pode adicionar mais campos conforme necessário
});

const Hydrometer = mongoose.model("Hydrometer", HydrometerSchema);

export default Hydrometer;
