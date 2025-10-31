const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');

/**
 * @route POST /api/employees
 * @desc Create a new employee
 * @access Public
 */
router.post('/', async (req, res) => {
  // #swagger.tags = ['Employees']
  try {
    const { vorname, nachname, beitrittsdatum, skillLevel } = req.body;

    // Validate required fields
    if (!vorname) {
      return res
        .status(400)
        .json({ error: 'Vorname ist erforderlich und darf nicht leer sein' });
    }
    if (!nachname) {
      return res
        .status(400)
        .json({ error: 'Nachname ist erforderlich und darf nicht leer sein' });
    }
    if (!beitrittsdatum) {
      return res.status(400).json({
        error: 'Beitrittsdatum ist erforderlich und darf nicht leer sein',
      });
    }
    if (skillLevel === undefined || skillLevel === null) {
      return res.status(400).json({
        error: 'Skilllevel ist erforderlich und darf nicht leer sein',
      });
    }

    // Validate skillLevel range
    if (!Number.isInteger(skillLevel) || skillLevel < 1 || skillLevel > 5) {
      return res.status(400).json({
        error: 'Skilllevel muss eine ganze Zahl zwischen 1 und 5 sein',
      });
    }

    const employee = new Employee({
      vorname,
      nachname,
      beitrittsdatum,
      skillLevel,
    });

    await employee.save();

    res.status(201).json(employee);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    res
      .status(500)
      .json({ error: 'Serverfehler beim Erstellen des Mitarbeiters' });
  }
});

/**
 * @route GET /api/employees
 * @desc Get all employees
 * @access Public
 */
router.get('/', async (req, res) => {
  // #swagger.tags = ['Employees']
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });

    if (employees.length === 0) {
      return res.status(200).json({
        message: 'Keine Mitarbeiter vorhanden',
        employees: [],
      });
    }

    res.status(200).json(employees);
  } catch {
    res.status(500).json({ error: 'Fehler beim Abrufen der Mitarbeiter' });
  }
});

/**
 * @route GET /api/employees/:id
 * @desc Get employee by ID
 * @access Public
 */
router.get('/:id', async (req, res) => {
  // #swagger.tags = ['Employees']
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ error: 'Mitarbeiter nicht gefunden' });
    }

    res.status(200).json(employee);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Ungültige Mitarbeiter-ID' });
    }
    res.status(500).json({ error: 'Fehler beim Abrufen des Mitarbeiters' });
  }
});

module.exports = router;
