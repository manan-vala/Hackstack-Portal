const mongoose = require('mongoose');

const connectDB = async () => {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hackstack';
  const isAtlas = MONGO_URI.includes('mongodb.net');

  try {
    const conn = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);

    if (isAtlas) {
      console.error(`
Atlas fix (pick one):
  1. https://cloud.mongodb.com → your project → Network Access → Add IP Address
     → "Add Current IP Address" (or "Allow Access from Anywhere" for dev only)
  2. Wait ~1 minute, then run: node server.js

Local dev alternative (no Atlas):
  docker compose up -d
  Set in .env: MONGO_URI=mongodb://127.0.0.1:27017/hackstack
`);
    } else {
      console.error(`
Local MongoDB is not reachable at ${MONGO_URI}
  • Start Docker: docker compose up -d   (from the backend folder)
  • Or install MongoDB Community and ensure it is running on port 27017
`);
    }

    process.exit(1);
  }
};

module.exports = connectDB;
