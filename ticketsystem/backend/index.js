const express = require('express');
const app = express();
const mongoose = require('mongoose');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');

// dotenv nur lokal
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ quiet: true });
}

// Middleware
app.use(express.json());
app.use(helmet());
app.use(morgan('common'));
app.use(cors({ origin: 'http://localhost:3000' }));

// Ticket API
const ticketRoute = require('./routes/ticket');
app.use('/api/tickets', ticketRoute);

// DB + Server
const PORT = process.env.PORT || 6001;
if (!process.env.MONGO_URL) {
  console.error('MONGO_URL not set!');
  process.exit(1);
}

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on Port: ${PORT}`));
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  });
