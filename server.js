const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

// Load environment variables
dotenv.config({ path: './config.env' });

// Validate essential environment variables
if (!process.env.DATABASE || !process.env.DATABASE_PASSWORD) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const app = require('./app');

// Construct database connection string with fallback
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

// Connect to MongoDB with error handling
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB connection successful!'))
  .catch((err) => {
    console.error('DB connection error:', err);
    process.exit(1);
  });

const port = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'production') {
  const server = app.listen(port, () => {
    console.log(`App running on port ${port}...`);
  });

  // Handle unhandled rejections
  process.on('unhandledRejection', (err) => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
      process.exit(1);
    });
  });
}

// Export the Express app for Vercel
module.exports = app;
