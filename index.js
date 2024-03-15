const fs = require("fs");
const express = require("express");
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');

const app = express();
const port = 5000;
const loans = require('./db.js').loans;

app.use(session({ secret: 'your secret key', resave: false, saveUninitialized: true }));
app.use(cors());
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));

app.use(express.json());

const readData = () => {
    try {
        
        const data = fs.readFileSync("./public/db.json");
        return JSON.parse(data);
    } catch (err) {
        console.error(err);
        return [];
    }
}

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

app.get('/loans', (req, res) => {
    const { search } = req.query;
    const data = readData();

    let filteredData = loans;

    if (search) {
        const lowerCaseSearch = search.toLowerCase();
        filteredData = filteredData.filter(loan =>
            loan.state.toLowerCase() === lowerCaseSearch ||
            loan.name.toLowerCase().includes(lowerCaseSearch)
        );
    }
    res.json(filteredData);
});

app.post('/login', (req, res) => {
    const { cedula } = req.body;
    if (cedula === '1095842339') {
        req.session.user = cedula;
        res.send('Logged in');
    } else {
        res.send('Invalid cedula');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.send('Logged out');
});

app.get('/dashboard', (req, res) => {
    if (req.session.user) {
        res.send(`Welcome, ${req.session.user}`);
    } else {
        res.send('Please log in first');
    }
});