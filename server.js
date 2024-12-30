require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const bodyParser = require('body-parser');
const { createClient } = require('@libsql/client'); // Correct import for Turso client
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000; // Use environment variable or default to 5000

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware to serve static files
app.use(express.static(path.join(__dirname)));

// Define the root route to serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html')); // Adjust the file path if necessary
});

// Create a connection to Turso database using @turso/client
const db = createClient({
    url: process.env.LIBSQL_URL, // Connection URL from .env file
    authToken: process.env.LIBSQL_AUTH_TOKEN, // Auth token from .env file
});

// Test the connection to Turso
db.execute('SELECT 1') // Use `execute` instead of `query`
    .then(() => {
        console.log('Connected to Turso database');
    })
    .catch((err) => {
        console.error('Database connection failed:', err);
    });

// Route to handle form submission
app.post('/submit', (req, res) => {
    const { name, age } = req.body;

    if (!name || !age) {
        return res.status(400).send('Name and age are required!');
    }

    const query = 'INSERT INTO students (name, age) VALUES (?, ?)';
    db.execute(query, [name, age]) // Use `execute` instead of `query`
        .then(() => {
            res.send('Student registered successfully!');
        })
        .catch((err) => {
            console.error('Error inserting data:', err);
            res.status(500).send('Error saving data to the database.');
        });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
