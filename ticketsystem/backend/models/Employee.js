const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema(
  {
    vorname: {
      type: String,
      required: [true, 'Vorname ist erforderlich'],
      trim: true,
    },
    nachname: {
      type: String,
      required: [true, 'Nachname ist erforderlich'],
      trim: true,
    },
    beitrittsdatum: {
      type: Date,
      required: [true, 'Beitrittsdatum ist erforderlich'],
    },
    skillLevel: {
      type: Number,
      required: [true, 'Skilllevel ist erforderlich'],
      min: [1, 'Skilllevel muss mindestens 1 sein'],
      max: [5, 'Skilllevel darf höchstens 5 sein'],
      validate: {
        validator: Number.isInteger,
        message: 'Skilllevel muss eine ganze Zahl sein',
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Employee', EmployeeSchema);
