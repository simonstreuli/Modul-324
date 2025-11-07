const express = require('express');
const app = express();
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

// Monitoring & logging
const promBundle = require('express-prom-bundle');
const client = require('prom-client');
const logger = require('./logger');

// Default metrics collection
client.collectDefaultMetrics({ timeout: 5000 });

// Middleware
app.use(express.json());
app.use(helmet());
app.use(morgan('common'));

// attach structured logger to requests
app.use((req, res, next) => {
  req.log = logger;
  next();
});

// Prometheus middleware (records http metrics)
const metricsMiddleware = promBundle({
  includeMethod: true,
  includePath: true,
  normalizePath: [
    // Valid tuple: [pattern, replacement]
    // This replaces MongoDB ObjectId in paths with :id for metrics aggregation
    ['/api/ticket/[0-9a-fA-F]{24}', '/api/ticket/:id'],
    ['/api/employee/[0-9a-fA-F]{24}', '/api/employee/:id'],
  ],
});
app.use(metricsMiddleware);

// Swagger UI (only mount if swagger.json exists)
try {
  // eslint-disable-next-line global-require
  const swaggerSpec = require('./swagger.json');
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
} catch (err) {
  // If the swagger.json file is missing (e.g., before generation), log a warning but continue
  console.warn('swagger.json not found — skipping /api-docs mounting');
}

// Employee API routes (Microservice 1)
const employeeRoute = require('./routes/employee');
app.use('/api/employees', employeeRoute);

// Ticket API routes (Microservice 2)
const ticketRoute = require('./routes/ticket');
app.use('/api/tickets', ticketRoute);

module.exports = app;

// Expose /metrics for Prometheus (in case promBundle metrics endpoint isn't used)
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
  } catch (err) {
    req.log && req.log.error({ msg: 'Failed to collect metrics', err });
    res.status(500).end();
  }
});
