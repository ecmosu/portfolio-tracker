const express = require('express');
const session = require('express-session');
const app = express();
const PORT = process.env.PORT || 9000;

app.use(session({
    secret: 'sjdf897dfj34yu0!kdshf07',
    resave: false,
    saveUninitialized: true,
}));

const bodyParser = require('body-parser');
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

const bcrypt = require('bcrypt');
const saltRounds = 10;

const path = require('path');
const pool = require('./dbpool');

// To Configure For Deployment
app.use(express.static(path.join(__dirname, 'build')));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.get('/authstatus', function (req, res) {
    let detail = { loggedIn: false, user: '' }
    if (req.session.user) {
        detail = { loggedIn: true, user: req.session.user }
    }

    res.send(detail);
});

app.post('/login', async (req, res) => {
    try {
        const username = req.body.username,
            password = req.body.password;

        const sql = "SELECT user_id, password_hash FROM users WHERE username = ?";
        const results = await pool.query(sql, [username]);
        const hash = results[0].password_hash.toString();
        const userId = results[0].user_id;
        const valid = await bcrypt.compare(password, hash);
        if (valid) {
            req.session.user = username;
            req.session.userId = userId;
            res.send({
                loggedIn: true,
                user: username
            });
            return;
        }
    }
    catch (err) {
        console.log(err);
    }
    res.send({ loggedIn: false, user: '', message: 'Invalid username or password.' });
});

app.get('/logout', async (req, res) => {
    if (req.session) {
        req.session.destroy();
    }
    res.send({
        loggedIn: false,
        user: ''
    });
});

app.post('/register', async (req, res) => {
    try {
        const username = req.body.username,
            password = req.body.password;

        const salt = await bcrypt.genSalt(saltRounds);
        const hash = await bcrypt.hash(password, salt);

        //Should probably add validation checks (duplicative usernames, etc).
        const sql = "INSERT INTO users (username, password_hash) VALUES (?, ?)";
        const results = await pool.query(sql, [username, hash]);
        req.session.userId = results.insertId;
        req.session.user = username;
        res.send({ loggedIn: true, user: req.session.user });
    }
    catch (err) {
        console.log(err);
        if (err.errno === 1062) {
            res.send({ loggedIn: false, user: '', message: 'The username selected already exists.' });
        }
        res.send({ loggedIn: false, user: '', message: 'An error was encountered while attempting to register.  Please contact support.' });
    }
});

//Portfolios Endpoints
app.get('/portfolios', async (req, res) => {
    try {
        if (req.session) {
            const userId = req.session.userId;
            const sql = `SELECT portfolio_id, portfolio_name FROM portfolios 
                INNER JOIN users ON portfolios.user_id = users.user_id
                WHERE users.user_id = ?`;
            const results = await pool.query(sql, [userId]);
            res.send({ portfolios: results });
            return;
        }
    }
    catch (err) {
        console.log(err);
    }
    res.send({ portfolios: [] });
});

app.get('/portfolios/:id', async (req, res) => {
    try {
        if (req.session) {
            const userId = req.session.userId;
            const portfolioId = req.params.id;
            const sql = `SELECT investments.investment_id, investments.symbol, investments.investment_name, 
                investments.latest_closing_price as latest_price, investments.latest_closing_price, holdings.average_cost_basis, 
                holdings.number_shares, holdings.date_updated 
            FROM investments 
                INNER JOIN holdings ON investments.investment_id = holdings.investment_id 
                INNER JOIN portfolios ON holdings.portfolio_id =  portfolios.portfolio_id 
            WHERE portfolios.user_id = ? AND portfolios.portfolio_id = ?`;
            const results = await pool.query(sql, [userId, portfolioId]);
            res.send({ holdings: results });
            return;
        }
    }
    catch (err) {
        console.log(err);
    }
    res.send({ holdings: [] });
});

app.delete('/portfolios/:id', async (req, res) => {
    try {
        if (req.session) {
            const userId = req.session.userId;
            const portfolioId = req.params.id;
            const sql = `DELETE FROM portfolios 
                WHERE portfolio_id = ? AND user_id = ?`;
            const results = await pool.query(sql, [portfolioId, userId]);
            console.log(results);
            res.send(true);
            return;
        }
    }
    catch (err) {
        console.log(err);
    }
    res.send(false);
});

app.post('/portfolios/add', async (req, res) => {
    try {
        if (req.session) {
            const userId = req.session.userId;
            const portfolioName = req.body.name;
            const sql = `INSERT INTO portfolios (user_id, portfolio_name) VALUES (?, ?)`;
            const results = await pool.query(sql, [userId, portfolioName]);
            console.log(results);
            if(results.affectedRows > 0)
            {
                res.send({ portfolioId: results.insertId });
                return;
            }
        }
    }
    catch (err) {
        console.log(err);
    }
    res.send(false);
});

app.listen(PORT);