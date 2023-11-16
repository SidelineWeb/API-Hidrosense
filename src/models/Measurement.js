import mongoose from "mongoose";

const MeasurementSchema = new mongoose.Schema({
  hydrometer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hydrometer',
    required: true,
  },
  pulses: {
    type: Number,
    required: true,
  },
  valueMcubic: {
    type: Number,
    required: true,
  },
  valueliters: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
  }
});

// Adicionando indexação
MeasurementSchema.index({ hydrometer: 1, timestamp: -1 });

const Measurement = mongoose.model("Measurement", MeasurementSchema);

export default Measurement;
