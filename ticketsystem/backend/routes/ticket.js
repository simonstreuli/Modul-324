const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const axios = require('axios');
const config = require('../config');

/**
 * Helper function to validate employee exists via API call
 * @param {string} mitarbeiterId - The employee ID to validate
 * @returns {Promise<boolean>} True if employee exists, false otherwise
 */
async function validateEmployeeExists(mitarbeiterId) {
  try {
    // Validate that mitarbeiterId is a valid MongoDB ObjectId format
    // This prevents injection attacks and ensures we only make valid requests
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!objectIdRegex.test(mitarbeiterId)) {
      return false;
    }

    // Use a controlled, internal URL for the API call
    // This prevents SSRF attacks by not allowing arbitrary URLs
    await axios.get(
      `http://localhost:${config.port}/api/employees/${mitarbeiterId}`,
      {
        timeout: 5000, // Add timeout to prevent hanging requests
      }
    );
    // If we reach here, the request succeeded (status 2xx)
    return true;
  } catch {
    // Any error (404, timeout, network issue) means employee doesn't exist or is unreachable
    return false;
  }
}

/**
 * Helper function to validate date fields based on status
 * @param {string} status - The ticket status
 * @param {Date} reviewDatum - Review date
 * @param {Date} doneDatum - Done date
 * @returns {Object} Validation result with error message if invalid
 */
function validateDateFields(status, reviewDatum, doneDatum) {
  // reviewDatum can only be set when status is 'Review' or 'Done'
  if (reviewDatum && status !== 'Review' && status !== 'Done') {
    return {
      valid: false,
      error:
        'reviewDatum kann nur gesetzt werden, wenn der Status "Review" oder "Done" ist',
    };
  }

  // doneDatum can only be set when status is 'Done'
  if (doneDatum && status !== 'Done') {
    return {
      valid: false,
      error: 'doneDatum kann nur gesetzt werden, wenn der Status "Done" ist',
    };
  }

  return { valid: true };
}

/**
 * @route POST /api/tickets
 * @desc Create a new ticket
 * @access Public
 */
router.post('/', async (req, res) => {
  // #swagger.tags = ['Tickets']
  try {
    const { status, titel, text, reviewDatum, doneDatum, mitarbeiterId } =
      req.body;

    // Validate required fields
    if (!titel) {
      return res
        .status(400)
        .json({ error: 'Titel ist erforderlich und darf nicht leer sein' });
    }
    if (!text) {
      return res
        .status(400)
        .json({ error: 'Text ist erforderlich und darf nicht leer sein' });
    }
    if (!mitarbeiterId) {
      return res.status(400).json({
        error:
          'Ein Ticket muss einem Mitarbeiter zugewiesen werden. Mitarbeiter-ID ist erforderlich',
      });
    }

    // Validate employee exists via API call to microservice 1
    const employeeExists = await validateEmployeeExists(mitarbeiterId);
    if (!employeeExists) {
      return res.status(400).json({
        error: `Mitarbeiter mit ID ${mitarbeiterId} wurde nicht gefunden. Bitte weisen Sie einen gültigen Mitarbeiter zu`,
      });
    }

    // Validate date fields based on status
    const dateValidation = validateDateFields(status, reviewDatum, doneDatum);
    if (!dateValidation.valid) {
      return res.status(400).json({ error: dateValidation.error });
    }

    const ticket = new Ticket({
      status: status || 'Open',
      titel,
      text,
      reviewDatum: reviewDatum || null,
      doneDatum: doneDatum || null,
      mitarbeiterId,
    });

    await ticket.save();

    res.status(201).json(ticket);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    res.status(500).json({ error: 'Serverfehler beim Erstellen des Tickets' });
  }
});

/**
 * @route GET /api/tickets
 * @desc Get all tickets
 * @access Public
 */
router.get('/', async (req, res) => {
  // #swagger.tags = ['Tickets']
  try {
    const tickets = await Ticket.find().sort({ createdAt: -1 });

    if (tickets.length === 0) {
      return res.status(200).json({
        message: 'Keine Tickets vorhanden',
        tickets: [],
      });
    }

    res.status(200).json(tickets);
  } catch {
    res.status(500).json({ error: 'Fehler beim Abrufen der Tickets' });
  }
});

/**
 * @route GET /api/tickets/:id
 * @desc Get ticket by ID
 * @access Public
 */
router.get('/:id', async (req, res) => {
  // #swagger.tags = ['Tickets']
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket nicht gefunden' });
    }

    res.status(200).json(ticket);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Ungültige Ticket-ID' });
    }
    res.status(500).json({ error: 'Fehler beim Abrufen des Tickets' });
  }
});

/**
 * @route PUT /api/tickets/:id
 * @desc Update a ticket
 * @access Public
 */
router.put('/:id', async (req, res) => {
  // #swagger.tags = ['Tickets']
  try {
    const { status, mitarbeiterId } = req.body;

    // If mitarbeiterId is being updated, validate it exists
    if (mitarbeiterId) {
      const employeeExists = await validateEmployeeExists(mitarbeiterId);
      if (!employeeExists) {
        return res.status(400).json({
          error: `Mitarbeiter mit ID ${mitarbeiterId} wurde nicht gefunden`,
        });
      }
    }

    // Validate date fields based on status if status is being updated
    if (status) {
      const { reviewDatum, doneDatum } = req.body;
      const dateValidation = validateDateFields(status, reviewDatum, doneDatum);
      if (!dateValidation.valid) {
        return res.status(400).json({ error: dateValidation.error });
      }
    }

    const ticket = await Ticket.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket nicht gefunden' });
    }

    res.status(200).json(ticket);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Ungültige Ticket-ID' });
    }
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    res.status(500).json({ error: 'Fehler beim Aktualisieren des Tickets' });
  }
});

/**
 * @route DELETE /api/tickets/:id
 * @desc Delete a ticket
 * @access Public
 */
router.delete('/:id', async (req, res) => {
  // #swagger.tags = ['Tickets']
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket nicht gefunden' });
    }

    res.status(200).json({ message: 'Ticket erfolgreich gelöscht' });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Ungültige Ticket-ID' });
    }
    res.status(500).json({ error: 'Fehler beim Löschen des Tickets' });
  }
});

module.exports = router;
