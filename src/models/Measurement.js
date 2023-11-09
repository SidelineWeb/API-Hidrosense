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
  time: {
    hour: Number,
    minute: Number,
    second: Number,
    required: true,
  },
  date: {
    day: Number,
    month: Number,
    year: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
  }
});

const Measurement = mongoose.model("Measurement", MeasurementSchema);

export default Measurement;
