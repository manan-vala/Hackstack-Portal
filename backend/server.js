require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// Import Routes
const moduleRoutes = require('./routes/moduleRoutes');
const progressRoutes = require('./routes/progressRoutes');
const quizRoutes = require('./routes/quizRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes'); // Required for the login flow

const app = express();

// Middleware
// Ensure CORS accepts requests from your Vite frontend
const corsOrigin = (origin, callback) => {
  const allowed = new Set(
    [
      process.env.FRONTEND_URL,
      'http://localhost:5173',
      'http://localhost:5174',
    ].filter(Boolean)
  );

  if (!origin || allowed.has(origin)) {
    return callback(null, true);
  }
  return callback(new Error(`CORS blocked origin: ${origin}`));
};

app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json()); // Parses incoming JSON payloads
app.use(cookieParser()); // Parse cookies

// Mount API Routes
app.use('/api/modules', moduleRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/leaderboards', leaderboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);

// Global Error Handler (Optional but recommended)
app.use((err, req, res, next) => {

  if (res.headersSent) {
    return next(err);
  }
  
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Start Server
const startServer = async () => {
  try {
    // Connect to database and wait for successful connection
    await connectDB();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server is up and running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
