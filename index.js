const fs = require("fs");
const express = require("express");
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require("path");

const app = express();
const port = 5000;

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json());

const dbPath = path.resolve(__dirname, 'db.json');

const readData = () => {
    try {
        const data = fs.readFileSync(dbPath);
        const parsedData = JSON.parse(data);
        return Array.isArray(parsedData.loans) ? parsedData : { loans: [] };
    } catch (err) {
        console.error(err);
        return { loans: [] };
    }
}

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

app.get('/loans', (req, res) => {
    const { search } = req.query;
    const data = readData();

    let filteredData = data.loans;

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