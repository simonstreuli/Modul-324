const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const Ticket = require('../models/Ticket');
const ticketRoute = require('../routes/ticket');
 
const app = express();
require('dotenv').config();
app.use(express.json());
app.use('/api/tickets', ticketRoute);
 
beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});
 
afterAll(async () => {
  await mongoose.connection.close();
});
 
describe('Ticket API', () => {
  let ticketId;
 
  it('should create a ticket', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .send({ title: 'Test', description: 'Test desc', status: 'open' });
    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('Test');
    ticketId = res.body._id;
  });

  it('should get all tickets', async () => {
    const res = await request(app).get('/api/tickets');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
   it('should get a ticket by id', async () => {
    const res = await request(app).get(`/api/tickets/${ticketId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(ticketId);
  });
 
  it('should update a ticket', async () => {
    const res = await request(app)
      .put(`/api/tickets/${ticketId}`)
      .send({ status: 'closed' });
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('closed');
  });
 
  it('should delete a ticket', async () => {
    const res = await request(app).delete(`/api/tickets/${ticketId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Ticket deleted');
  });
 
  it('should return 400 for invalid ticket id', async () => {
    const res = await request(app).get('/api/tickets/invalidid');
    expect(res.statusCode).toBe(400);
  });
});