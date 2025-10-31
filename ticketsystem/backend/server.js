const mongoose = require('mongoose');
const app = require('./index');
const config = require('./config');

// Database connection and server startup
mongoose
  .connect(config.mongoUri)
  .then(() => {
    app.listen(config.port, () =>
      console.log(`Server running on Port: ${config.port}`)
    );
  })
  .catch((error) => {
    console.error(`Database connection failed: ${error.message}`);
    process.exit(1);
  });
