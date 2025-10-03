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
});