require('dotenv').config();
const express = require('express');
const connectDB = require('./database/db');
const salesRoutes = require('./routes/salesRoutes');

const app = express();

// ── CORS (must come before all routes) ──────────────────────────────────────
const ALLOWED_ORIGINS = [
    'https://goftem-sales.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
];

app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') return res.status(200).end();
    next();
});

// ── Body parser ──────────────────────────────────────────────────────────────
app.use(express.json());

// ── DB middleware — connect before every request (cached by isConnected) ─────
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        console.error('DB connection failed:', err.message);
        res.status(500).json({ message: 'Database connection failed' });
    }
});

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/sales', salesRoutes);

app.get('/', (req, res) => {
    res.send('GOFTEM STORES API is running...');
});

// ── Local dev server ─────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
