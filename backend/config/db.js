import mongoose from 'mongoose';

export const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/studypilot';
  const fallbackUri = 'mongodb://127.0.0.1:27017/studypilot';

  try {
    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (primaryErr) {
    console.warn(`Primary MongoDB Connection Warning (${primaryErr.message}). Trying fallback local database...`);
    try {
      const fallbackConn = await mongoose.connect(fallbackUri, {
        serverSelectionTimeoutMS: 5000
      });
      console.log(`MongoDB Connected (Fallback): ${fallbackConn.connection.host}`);
    } catch (fallbackErr) {
      console.error(`MongoDB Connection Error: ${fallbackErr.message}`);
    }
  }
};
