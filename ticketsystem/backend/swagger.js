const swaggerAutogen = require('swagger-autogen')();
const config = require('./config');

const doc = {
  info: {
    title: 'Ticketsystem API',
    description:
      'API Documentation for Employee and Ticket Management Microservices',
  },
  host: `${config.hostUrl}`,
  schemes: ['http'],
  tags: [
    {
      name: 'Employees',
      description: 'Microservice 1: Employee management endpoints',
    },
    {
      name: 'Tickets',
      description: 'Microservice 2: Ticket management endpoints',
    },
  ],
};

const outputFile = './swagger.json';
const endpointsFiles = ['./index.js'];

swaggerAutogen(outputFile, endpointsFiles, doc);
