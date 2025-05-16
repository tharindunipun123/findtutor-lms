const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const dotenv = require('dotenv');
const { initializeDatabase } = require('./db/setup');

// Load environment variables
dotenv.config();

// Create express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database and start server
async function startServer() {
  try {
    // Initialize database
    const dbInitialized = await initializeDatabase();
    if (!dbInitialized) {
      console.error('Failed to initialize database. Exiting.');
      process.exit(1);
    }

    // Once database is initialized, create connection pool
    const pool = mysql.createPool({
      host: 'localhost',
      user: 'root',
      password:  'tharindu2005V#',
      database: 'tutor_finder',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Import route files
    const userRoutes = require('./routes/users');
    const teacherRoutes = require('./routes/teachers');
    const studentRoutes = require('./routes/students');
    const classRoutes = require('./routes/classes');
    const requestRoutes = require('./routes/requests');
    const subscriptionRoutes = require('./routes/subscriptions');
    const notificationRoutes = require('./routes/notifications');
    const subjectRoutes = require('./routes/subjects');

    // Use routes
    app.use('/api/users', userRoutes(pool));
    app.use('/api/teachers', teacherRoutes(pool));
    app.use('/api/students', studentRoutes(pool));
    app.use('/api/classes', classRoutes(pool));
    app.use('/api/requests', requestRoutes(pool));
    app.use('/api/subscriptions', subscriptionRoutes(pool));
    app.use('/api/notifications', notificationRoutes(pool));
    app.use('/api/subjects', subjectRoutes(pool));

    // Basic health check endpoint
    app.get('/health', (req, res) => {
      res.status(200).json({ status: 'ok', message: 'Server is running' });
    });

    // Global error handler
    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'production' ? {} : err
      });
    });

    // Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

module.exports = app;