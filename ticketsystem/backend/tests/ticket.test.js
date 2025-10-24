const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const Ticket = require('../models/Ticket');
const ticketRoute = require('../routes/ticket');

const app = express();

// dotenv nur lokal
if (false) {
  require('dotenv').config({ quiet: true });
}

app.use(express.json());
app.use('/api/tickets', ticketRoute);

// Prüfen, ob Secrets existieren
beforeAll(async () => {
  jest.setTimeout(30000); // 30 Sekunden Timeout

  if (!process.env.MONGO_URL) {
    console.error('❌ MONGO_URL is not set!');
    process.exit(1);
  } else {
    console.log('✅ MONGO_URL is set');
  }

  if (!process.env.PORT) {
    console.error('❌ PORT is not set!');
    process.exit(1);
  } else {
    console.log('✅ PORT is set');
  }

  // Mongoose verbinden
  await mongoose.connect(process.env.MONGO_URL);
});

// DB sauber schließen
afterAll(async () => {
  await mongoose.connection.close();
});

describe('Ticket API', () => {
  let ticketId;

  it('should create a ticket', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .send({ title: 'Test', description: 'Test desc', status: 'open' });
    console.log('Create ticket response:', res.body);
    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('Test');
    ticketId = res.body._id;
  });

  it('should get all tickets', async () => {
    const res = await request(app).get('/api/tickets');
    console.log('Get all tickets response:', res.body);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should get a ticket by id', async () => {
    const res = await request(app).get(`/api/tickets/${ticketId}`);
    console.log('Get ticket by id response:', res.body);
    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(ticketId);
  });

  it('should update a ticket', async () => {
    const res = await request(app)
      .put(`/api/tickets/${ticketId}`)
      .send({ status: 'closed' });
    console.log('Update ticket response:', res.body);
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('closed');
  });

  it('should delete a ticket', async () => {
    const res = await request(app).delete(`/api/tickets/${ticketId}`);
    console.log('Delete ticket response:', res.body);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Ticket deleted');
  });

  it('should return 400 for invalid ticket id', async () => {
    const res = await request(app).get('/api/tickets/invalidid');
    console.log('Invalid ticket id response:', res.body);
    expect(res.statusCode).toBe(400);
  });
});
