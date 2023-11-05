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
    second: Number
  },
  date: {
    day: Number,
    month: Number,
    year: Number
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const Measurement = mongoose.model("Measurement", MeasurementSchema);

export default Measurement;