const express = require('express');
const session = require('express-session');
const fetch = require('node-fetch');
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
            // Update User Login Time
            const updateSql = "UPDATE users SET last_login = NOW() WHERE user_id = ?";
            await pool.query(updateSql, [userId]);
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

app.get('/sectors', async (req, res) => {
    try {
        const sql = `SELECT sector_id, sector_name FROM sectors ORDER BY sector_name`;
        const results = await pool.query(sql);
        res.send({ sectors: results });
        return;
    }
    catch (err) {
        console.log(err);
    }
    res.send({ sectors: results });
});

app.get('/user/investments', async (req, res) => {
    try {
        if (req.session && req.session.userId) {
            const userId = req.session.userId;
            const sql = `SELECT investment_id, investment_name, IFNULL(sector_name, 'Unclassified') as sector_name, latest_closing_price AS current_price, price_date AS date_updated
                FROM investments
                LEFT JOIN sectors on investments.sector_id = sectors.sector_id
                WHERE user_id = ?`;
            const results = await pool.query(sql, [userId]);
            res.send({ userInvestments: results });
            return;
        }
    }
    catch (err) {
        console.log(err);
    }
    res.send({ userInvestments: [] });
});

app.post('/user/investments/add', async (req, res) => {
    try {
        if (req.session && req.session.userId) {
            const userId = req.session.userId;
            const investment = req.body;

            const sql = `INSERT INTO investments 
                (symbol, investment_name, investmenttype_id, latest_closing_price, price_date, sector_id, user_id)
                VALUES ('N/A', ?, (SELECT investmenttype_id FROM investmenttypes WHERE api_code = 'USER' LIMIT 1),
                ?, NOW(), (SELECT sector_id FROM sectors WHERE sector_name = ? LIMIT 1), ?)`
            const results = await pool.query(sql, [investment.name, investment.price, investment.sector, userId]);
            if (results.affectedRows > 0) {
                //Successfully Added
                res.send({ success: true, message: "The investment was successfully added." });
                return;
            }
        }
    }
    catch (err) {
        console.log(err);
    }
    res.send({ success: false, message: "The investment could not be added." });
});

app.post('/user/investments/edit', async (req, res) => {
    try {
        if (req.session && req.session.userId) {
            const userId = req.session.userId;
            const investment = req.body;

            const sql = `UPDATE investments 
                SET investment_name = ?, 
                    latest_closing_price = ?, 
                    sector_id = (SELECT sector_id FROM sectors WHERE sector_name = ? LIMIT 1),
                    price_date = NOW()
                WHERE investment_id = ? AND user_id = ?`
            const results = await pool.query(sql, [investment.investment_name, investment.current_price, investment.sector_name, investment.investment_id, userId]);
            if (results.affectedRows > 0) {
                //Successfully Added
                res.send({ success: true, message: "The investment was successfully updated." });
                return;
            }
        }
    }
    catch (err) {
        console.log(err);
    }
    res.send({ success: false, message: "The investment could not be updated." });
});

app.delete('/user/investments/:id', async (req, res) => {
    try {
        if (req.session && req.session.userId) {
            const userId = req.session.userId;
            const investmentId = req.params.id;
            const sql = `DELETE FROM investments 
                WHERE investment_id = ? AND user_id = ?`;
            const results = await pool.query(sql, [investmentId, userId]);
            console.log(results);
            res.send({ success: true, message: "The investment was successfully deleted." });
            return;
        }
    }
    catch (err) {
        console.log(err);
    }
    res.send({ success: false, message: "An error occurred.  The investment was not deleted." });
});

//Portfolios Endpoints
app.get('/portfolios', async (req, res) => {
    try {
        if (req.session && req.session.userId) {
            const userId = req.session.userId;
            const portfolioName = req.query.search;
            const sql = `SELECT portfolio_id, portfolio_name FROM portfolios 
                INNER JOIN users ON portfolios.user_id = users.user_id
                WHERE users.user_id = ? AND portfolio_name LIKE ?`;
            const results = await pool.query(sql, [userId, '%' + portfolioName + '%']);
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
        if (req.session && req.session.userId) {
            const userId = req.session.userId;
            const portfolioId = req.params.id;
            const sectorId = req.query.sector_id;
            const assetId = req.query.asset_id;
            const sql = `SELECT investments.investment_id, investments.symbol, investments.investment_name, 
                investments.latest_closing_price as latest_price, investments.latest_closing_price, holdings.average_cost_basis, 
                holdings.number_shares, investments.price_date, holdings.date_updated, 
                investments.investmenttype_id, investmenttypes.api_code, investmenttypes.investmenttype_name, investments.sector_id, IFNULL(sector_name, 'Unclassified') as sector_name
            FROM investments 
                INNER JOIN holdings ON investments.investment_id = holdings.investment_id 
                INNER JOIN portfolios ON holdings.portfolio_id =  portfolios.portfolio_id
                INNER JOIN investmenttypes ON investments.investmenttype_id = investmenttypes.investmenttype_id
                LEFT JOIN sectors ON investments.sector_id = sectors.sector_id
            WHERE portfolios.user_id = ? AND portfolios.portfolio_id = ? 
                AND IFNULL(investments.sector_id, '') LIKE (?)
                AND IFNULL(investments.investmenttype_id, '') LIKE (?)
            ORDER BY investments.investment_name`;
            const results = await pool.query(sql, [userId, portfolioId,
                sectorId === undefined ? '%' : (sectorId === "null" ? "" : sectorId),
                assetId === undefined ? '%' : assetId]);
            res.send({ holdings: results });
            return;
        }
    }
    catch (err) {
        console.log(err);
    }
    res.send({ holdings: [] });
});

app.post('/portfolios/:id/addholding', async (req, res) => {
    try {
        if (req.session && req.session.userId) {
            const userId = req.session.userId;
            const portfolioId = req.params.id;
            const investment = req.body;

            const sql = `INSERT INTO holdings (portfolio_id, investment_id, average_cost_basis, date_updated, number_shares)
                SELECT portfolio_id, investment_id, ?, NOW(), ? FROM users
                    INNER JOIN portfolios ON users.user_id = portfolios.user_id
                    INNER JOIN investments ON users.user_id = investments.user_id
                WHERE users.user_id = ? AND investments.investment_id = ? AND portfolio_id = ?`
            const results = await pool.query(sql, [investment.basis, investment.shares, userId, investment.investment_id, portfolioId]);
            if (results.affectedRows > 0) {
                //Successfully Added
                res.send({ success: true, message: "The investment was successfully added to holdings." });
                return;
            }
        }
    }
    catch (err) {
        console.log(err);
        if (err.errno === 1062) {
            res.send({ success: false, message: "The selected investment already exists in this portfolio." });
            return;
        }
    }
    res.send({ success: false, message: "The investment could not be added." });
});

app.post('/portfolios/:id/addinvestment', async (req, res) => {
    try {
        if (req.session && req.session.userId) {
            const userId = req.session.userId;
            const portfolioId = req.params.id;
            const investment = req.body;

            //Get Investment ID
            const invesmentId = await addInvestment(investment.ticker);
            if (invesmentId === -1) {
                res.send({ success: true, message: "The investment ticker is invalid." });
                return;
            }

            const sql = `INSERT INTO holdings (portfolio_id, investment_id, average_cost_basis, date_updated, number_shares)
            SELECT portfolio_id, ?, ?, NOW(), ? FROM users
                INNER JOIN portfolios ON users.user_id = portfolios.user_id
            WHERE users.user_id = ? AND portfolio_id = ?`
            const results = await pool.query(sql, [invesmentId, investment.basis, investment.shares, userId, portfolioId]);
            if (results.affectedRows > 0) {
                //Successfully Added
                res.send({ success: true, message: "The investment was successfully added to holdings." });
                return;
            }
        }
    }
    catch (err) {
        console.log(err);
    }
    res.send({ success: false, message: "The investment could not be added." });
});

app.delete('/portfolios/:portfolioid/holding/:investmentid', async (req, res) => {
    try {
        if (req.session && req.session.userId) {
            const userId = req.session.userId;
            const portfolioId = req.params.portfolioid;
            const investmentId = req.params.investmentid;
            const sql = `DELETE holdings FROM holdings
                INNER JOIN portfolios ON holdings.portfolio_id = portfolios.portfolio_id
                WHERE holdings.portfolio_id = ? AND investment_id = ? AND user_id = ?`;
            const results = await pool.query(sql, [portfolioId, investmentId, userId]);
            console.log(results);
            res.send({ success: true, message: "The holding was successfully deleted." });
            return;
        }
    }
    catch (err) {
        console.log(err);
    }
    res.send({ success: false, message: "An error occurred.  The holding was not deleted." });
});

app.post('/portfolios/:portfolioid/holding/:investmentid', async (req, res) => {
    try {
        if (req.session && req.session.userId) {
            const userId = req.session.userId;
            const portfolioId = req.params.portfolioid;
            const investmentId = req.params.investmentid;
            const investment = req.body;

            const sql = `UPDATE holdings 
                INNER JOIN portfolios ON holdings.portfolio_id = portfolios.portfolio_id
                SET average_cost_basis = ?, 
                    number_shares = ?, 
                    date_updated = NOW()
                WHERE holdings.investment_id = ? AND holdings.portfolio_id = ? AND user_id = ?`
            const results = await pool.query(sql, [investment.basis, investment.shares, investmentId, portfolioId, userId]);
            if (results.affectedRows > 0) {
                //Successfully Added
                res.send({ success: true, message: "The holding was successfully updated." });
                return;
            }
        }
    }
    catch (err) {
        console.log(err);
    }
    res.send({ success: false, message: "The holding could not be updated." });
});

app.delete('/portfolios/:id', async (req, res) => {
    try {
        if (req.session && req.session.userId) {
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
        if (req.session && req.session.userId) {
            const userId = req.session.userId;
            const portfolioName = req.body.name;
            const sql = `INSERT INTO portfolios (user_id, portfolio_name) VALUES (?, ?)`;
            const results = await pool.query(sql, [userId, portfolioName]);
            console.log(results);
            if (results.affectedRows > 0) {
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

addInvestment = async (ticker) => {
    //Check if investment is currently in DB.
    //Determine If Any Rates Are Needed
    const sql = `SELECT investment_id, symbol, price_date 
            FROM investments
            WHERE user_id IS NULL AND symbol = ?`;
    const results = await pool.query(sql, [ticker]);
    if (results.length > 0) {
        return results[0].investment_id;
    }
    else { //Insert New Investment
        const companyResponse = await fetch(`https://api.iextrading.com/1.0/stock/${ticker}/company`);
        const priceResponse = await fetch(`https://api.iextrading.com/1.0/stock/${ticker}/ohlc`);
        if (companyResponse.status === 200 && priceResponse.status === 200) {
            const companyJson = await companyResponse.json();
            const priceJson = await priceResponse.json();

            //Determine If Sector Is In DB
            if (companyResponse.sector !== "") {
                const sectorSql = `SELECT sector_id FROM sectors WHERE sector_name = ?`;
                const results = await pool.query(sectorSql, [companyJson.sector]);
                if (results.length === 0) {
                    //Insert Missing Sector
                    const sectorInsertSql = `INSERT INTO sectors (sector_name) VALUES (?)`;
                    await pool.query(sectorInsertSql, [companyJson.sector]);
                }
            }

            //Insert Investment
            const sql = `INSERT INTO investments (symbol, investment_name, latest_closing_price, price_date, sector_id, investmenttype_id)
            VALUES (?, ?, ?, ?, 
                (SELECT sector_id FROM sectors WHERE sector_name = ? LIMIT 1),
                (SELECT investmenttype_id FROM investmenttypes WHERE api_code = ? LIMIT 1));`;
            const results = await pool.query(sql, [ticker, companyJson.companyName, priceJson.close.price, new Date(priceJson.close.time), companyJson.sector, companyJson.issueType]);
            console.log(results);
            if (results.affectedRows > 0) {
                return results.insertId;
            }
        }
    }
    return -1;
}

updateIEXSectors = async () => {
    try {
        //Determine If Any Rates Are Needed
        const sql = `SELECT sector_id, sector_name FROM sectors`;
        const results = await pool.query(sql);
        //Gather Latest Sector Details From IEX API
        const sectorResponse = await fetch('https://api.iextrading.com/1.0/stock/market/sector-performance');
        if (sectorResponse.status === 200) {
            const sectorJson = await sectorResponse.json();
            sectorJson.forEach(element => {
                const sectorEntry = results.find((sector) => sector.sector_name === element.name);
                if (sectorEntry === undefined) {
                    const create = `INSERT INTO sectors (sector_name) VALUES (?)`;
                    pool.query(create, [element.name]);
                }
            });
        }
    }
    catch (err) {
        console.log(err);
    }
}

updateIEXRates = async () => {
    try {
        //Determine If Any Rates Are Needed
        const sql = `SELECT investment_id, symbol, price_date 
        FROM investments
        WHERE user_id IS NULL AND price_date < NOW() - INTERVAL 1 DAY`;
        const results = await pool.query(sql);
        if (results.length > 0) {
            //Gather Latest Closing Rates And Ticker Details From IEX API
            const tickerResponse = await fetch('https://api.iextrading.com/1.0/ref-data/symbols');
            const closeResponse = await fetch('https://api.iextrading.com/1.0/stock/market/ohlc');
            if (closeResponse.status === 200 && tickerResponse.status === 200) {
                const closeJson = await closeResponse.json();
                const tickerJson = await tickerResponse.json();
                results.forEach(element => {
                    const tickerDetail = tickerJson.find((ticker) => ticker.symbol === element.symbol);
                    if (tickerDetail !== undefined) {
                        const closeDetail = closeJson[element.symbol];
                        const update = `UPDATE investments
                            SET investment_name = ?, latest_closing_price = ?, price_date = ?, investmenttype_id = (SELECT investmenttype_id FROM investmenttypes WHERE api_code = ? LIMIT 1)
                            WHERE investment_id = ?;`;
                        pool.query(update, [tickerDetail.name, closeDetail.close.price, new Date(closeDetail.close.time), tickerDetail.type, element.investment_id]);
                    }
                });
            }
        }
    }
    catch (err) {
        console.log(err);
    }
}

runUpdateTasks = async () => {
    await updateIEXSectors();
    await updateIEXRates();
}

/* Node Services - These should be decomposed and run as a seperate service from the API,
for purposes of this project they will run under a single service. */
runUpdateTasks();
const refreshTime = 1000 * 60 * 60; //Every Hour  
setInterval(() => {
    runUpdateTasks();
}, refreshTime);