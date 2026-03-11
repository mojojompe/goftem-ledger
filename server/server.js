require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./database/db');
const salesRoutes = require('./routes/salesRoutes');

// Connect to database
connectDB();

const app = express();

// CORS — must be FIRST, before all routes
const allowedOrigins = [
    'https://goftem-sales.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
];

app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

app.use(express.json());

// Routes
app.use('/api/sales', salesRoutes);

// Base route
app.get('/', (req, res) => {
    res.send('GOFTEM STORES API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
