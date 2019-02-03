const express = require('express');
const session = require('express-session');
const app = express();

app.use(session({
    secret: 'sjdf897dfj34yu0!kdshf07'
}));

const bcrypt = require('bcrypt');
const saltRounds = 10;

const path = require('path');
const pool = require('./dbpool');

// To Configure For Deployment
// app.use(express.static(path.join(__dirname, 'build')));

// app.get('/', function(req, res) {
//   res.sendFile(path.join(__dirname, 'build', 'index.html'));
// });

app.post('/login', function (req, res) {
    try {
        const username = req.body.username,
            password = req.body.password;

        const sql = "SELECT password_hash FROM users WHERE username = ?";
        const results = await pool.query(sql, [username]);
        const hash = results[0].password_hash.toString();
        const valid = await bcrypt.compare(password, hash);
        if (valid) {
            req.session.user = username;
            res.status(200).send({
                success: true,
                username
            });
        }
        res.send(403);
    }
    catch (err) {
        console.log(err);
        res.send(403);
    }
});

app.post('/register', async (req, res) => {
    try {
        const username = req.body.username,
            password = req.body.password;

        const salt = await bcrypt.genSalt(saltRounds);
        const hash = await bcrypt.hash(password, salt);

        const sql = "INSERT INTO users (username, password_hash) VALUES (?, ?)";
        const results = await pool.query(sql, [username, hash]);
        req.session.user = username;
        res.status(200).send({
            success: true,
            username
        });
    }
    catch (err) {
        console.log(err);
        res.send(403);
    }
});

app.listen(9000);