require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2'); // Import the MySQL library
const path = require('path');


const app = express();
const PORT = process.env.PORT || 5000; // Use environment variable or default to 5000

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Added JSON parsing for API requests

// Middleware to serve static files
app.use(express.static(path.join(__dirname)));

// Define the root route to serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Create a MySQL connection

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: {
        rejectUnauthorized: true
    }
});


// Test the MySQL connection
db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err.stack);
        process.exit(1); // Exit the app if the database connection fails
    }
    console.log('Connected to MySQL database');
});

// Route to handle form submission
app.post('/submit', (req, res) => {
    const { name, age } = req.body;

    // Validate request payload
    if (!name || !age) {
        return res.status(400).send('Name and age are required!');
    }

    const query = 'INSERT INTO students (name, age) VALUES (?, ?)';
    db.query(query, [name, age], (err, results) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).send('Error saving data to the database.');
        }
        res.send('Student registered successfully!');
    });
});

// Add a route to fetch all students (optional)
app.get('/students', (req, res) => {
    const query = 'SELECT * FROM students';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            return res.status(500).send('Error fetching data from the database.');
        }
        res.json(results); // Send the results as JSON
    });
});

// Add graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down gracefully...');
    db.end((err) => {
        if (err) {
            console.error('Error closing the database connection:', err);
        } else {
            console.log('Database connection closed.');
        }
        process.exit(0);
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
