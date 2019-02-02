const mysql = require('promise-mysql');
const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'portfoliotracker'
});

module.exports = pool;