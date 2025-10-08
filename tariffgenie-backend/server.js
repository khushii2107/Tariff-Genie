const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// Import routes
const userRoutes = require('./routes/userRoutes');
const planRoutes = require('./routes/planRoutes');
const dataXchangeRoutes = require('./routes/dataXchangeRoutes');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware setup
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(bodyParser.json()); // Parse incoming JSON requests
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/dataxchange', dataXchangeRoutes);

// Simple root route for testing
app.get('/', (req, res) => {
    res.send('Welcome to the TariffGenie Backend API!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

