require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./database/db');
const salesRoutes = require('./routes/salesRoutes');

// Connect to database
connectDB();

const app = express();

// Middleware
const corsOptions = {
    origin: [
        'https://goftem-sales.vercel.app',
        'http://localhost:5173',
        'http://localhost:3000',
    ],
    credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/sales', salesRoutes);

// Base route
app.get('/', (req, res) => {
    res.send('GOFTEM STORES API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
