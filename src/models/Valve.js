import mongoose from "mongoose";

const valveControlSchema = new mongoose.Schema({
  hydrometer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hydrometer',
    required: true,
  },
  opened: {
    type: Boolean,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

const ValveControl = mongoose.model("ValveControl", valveControlSchema);

export default ValveControl;
