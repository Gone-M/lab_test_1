const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        mongoose.set('strictQuery', false);
        
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error('Database connection error:', err.message);
        console.log('Retrying connection in 5 seconds...');
        setTimeout(connectDB, 5002);
    }
};

module.exports = connectDB; 