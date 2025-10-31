const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Review', 'Done'],
      required: [true, 'Status ist erforderlich'],
      default: 'Open',
    },
    titel: {
      type: String,
      required: [true, 'Titel ist erforderlich'],
      trim: true,
    },
    text: {
      type: String,
      required: [true, 'Text ist erforderlich'],
      trim: true,
    },
    reviewDatum: {
      type: Date,
      default: null,
    },
    doneDatum: {
      type: Date,
      default: null,
    },
    mitarbeiterId: {
      type: String,
      required: [true, 'Mitarbeiter-Zuweisung ist erforderlich'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Ticket', TicketSchema);
