const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");

dotenv.config();

// Erlaubt Zugriff von localhost:3000
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

// Database connection
const PORT = process.env.PORT || 6001;
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on Port: ${PORT}`));
  })
  .catch((error) => console.log(`${error} did not connect`));

//Middleware

app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

// Ticket API routes
const ticketRoute = require("./routes/tickets");
app.use("/api/tickets", ticketRoute);
