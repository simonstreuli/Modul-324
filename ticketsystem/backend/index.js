const express = require('express');
const app = express();
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

// Middleware
app.use(express.json());
app.use(morgan('common'));
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(require('./swagger.json'))
);

// Employee API routes (Microservice 1)
const employeeRoute = require('./routes/employee');
app.use('/api/employees', employeeRoute);

// Ticket API routes (Microservice 2)
const ticketRoute = require('./routes/ticket');
app.use('/api/tickets', ticketRoute);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

module.exports = app;
