const mongoose = require('mongoose');

// Cache the connection across serverless invocations
let isConnected = false;

const connectDB = async () => {
    if (isConnected) return;

    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            bufferCommands: false,
        });
        isConnected = true;
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB connection error: ${error.message}`);
        // Don't call process.exit(1) on Vercel — it kills the function
        throw error;
    }
};

module.exports = connectDB;
