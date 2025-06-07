// lib/mongodb.js
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

const options = {
  // Default pool size: 5. Bisa disesuaikan
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000, // optional: fail faster
};

let isConnected = false;

async function dbConnect() {
  if (isConnected) {
    return;
  }

  try {
    const conn = await mongoose.connect(MONGODB_URI, options);
    isConnected = true;
    // console.log('[MongoDB] ✅ Connected to DB:', conn.connection.name, "\n");
  } catch (error) {
    console.error('[MongoDB] ❌ Connection error:', error);
    throw error;
  }
}

export default dbConnect;