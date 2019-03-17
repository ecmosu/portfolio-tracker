--User Login
-- Register
--End Point: /register
INSERT INTO users (username, password_hash) VALUES (:usernameInput, :passwordInputHashed);

-- Login, check that entered data exists.  Returned hash will be compared to the provided password to authenticate via the bcrypt library.
--End Point: /login
SELECT user_id, password_hash FROM users WHERE username = :usernameInput;

--Update User Login Time
--End Point: /login
UPDATE users SET last_login = NOW() WHERE user_id = :user_id

--Portfolios
--View('Select') Portfolios - With Search Capability
--End Point: /portfolios
SELECT portfolio_id, portfolio_name FROM portfolios 
  INNER JOIN users ON portfolios.user_id = users.user_id
  WHERE users.user_id = :user_id AND portfolio_name LIKE :search_string

-- Add portfolio
--End Point: /portfolios/add
INSERT INTO portfolios (user_id, portfolio_name) VALUES (:user_id, :portfolioNameInput);

-- View('Select') Portfolio - With Search/Filtering Capability Based On Selection In Graph
--End Point: /portfolios/:id
SELECT investments.investment_id, investments.symbol, investments.investment_name, 
  investments.latest_closing_price as latest_price, investments.latest_closing_price, holdings.average_cost_basis, 
  holdings.number_shares, investments.price_date, holdings.date_updated, 
  investments.investmenttype_id, investmenttypes.api_code, investmenttypes.investmenttype_name, investments.sector_id, IFNULL(sector_name, 'Unclassified') as sector_name
FROM investments 
  INNER JOIN holdings ON investments.investment_id = holdings.investment_id 
  INNER JOIN portfolios ON holdings.portfolio_id =  portfolios.portfolio_id
  INNER JOIN investmenttypes ON investments.investmenttype_id = investmenttypes.investmenttype_id
  LEFT JOIN sectors ON investments.sector_id = sectors.sector_id
WHERE portfolios.user_id = :user_id AND portfolios.portfolio_id = :portfolio_id 
  AND IFNULL(investments.sector_id, '') LIKE (:sector_id)
  AND IFNULL(investments.investmenttype_id, '') LIKE (:investmenttype_id)
ORDER BY investments.investment_name

-- Delete portfolio
--End Point: /portfolios/:id
DELETE FROM portfolios WHERE portfolio_id = :id AND user_id = :user_id;

-- Delete individual holding
--End Point: /portfolios/:portfolioid/holding/:investmentid
DELETE holdings FROM holdings
  INNER JOIN portfolios ON holdings.portfolio_id = portfolios.portfolio_id
  WHERE holdings.portfolio_id = :portfolio_id AND investment_id = :investment_id AND user_id = :user_id

--User Investments - These are investments created by an end-user, and not populated via API.
--Entities in the investments table with a NULL user are global investments, while those with
--a user are specific ONLY to an individual user.
-- View('Select') User Investments
--End Point: /user/investments
SELECT investment_id, investment_name, IFNULL(sector_name, 'Unclassified') as sector_name, latest_closing_price AS current_price, price_date AS date_updated
  FROM investments
  LEFT JOIN sectors on investments.sector_id = sectors.sector_id
  WHERE user_id = :user_id

--Add User Investment
--End Point: /user/investments/add
INSERT INTO investments 
  (symbol, investment_name, investmenttype_id, latest_closing_price, price_date, sector_id, user_id)
  VALUES ('N/A', :investment_name, (SELECT investmenttype_id FROM investmenttypes WHERE api_code = 'USER' LIMIT 1),
  :investment_price, NOW(), (SELECT sector_id FROM sectors WHERE sector_name = :sector LIMIT 1), :user_id)

--Update User Investment
--End Point: /user/investments/edit
UPDATE investments 
  SET investment_name = :investment_name, 
    latest_closing_price = :investment_price, 
    sector_id = (SELECT sector_id FROM sectors WHERE sector_name = :sector LIMIT 1),
    price_date = NOW()
  WHERE investment_id = :investment_id AND user_id = :user_id

--Delete User Investment
--End Point: /user/investments/:id
DELETE FROM investments 
  WHERE investment_id = :investment_id AND user_id = :user_id

--Sectors
--View('Select') Sectors
--End Point: /sectors
SELECT sector_id, sector_name FROM sectors ORDER BY sector_name

--Update Holding
--End Point: /portfolios/:portfolioid/holding/:investmentid
UPDATE holdings 
  INNER JOIN portfolios ON holdings.portfolio_id = portfolios.portfolio_id
  SET average_cost_basis = :average_cost_basis, 
    number_shares = :number_shares, 
    date_updated = NOW()
  WHERE holdings.investment_id = :investment_id AND holdings.portfolio_id = :portfolio_id AND user_id = :user_id

--Create New Holding
--End Point: /portfolios/:id/addholding - User Investment Holding
INSERT INTO holdings (portfolio_id, investment_id, average_cost_basis, date_updated, number_shares)
  SELECT portfolio_id, investment_id, :average_cost_basis, NOW(), :number_shares FROM users
    INNER JOIN portfolios ON users.user_id = portfolios.user_id
    INNER JOIN investments ON user.user_id = investments.user_id
  WHERE users.user_id = :user_id AND investments.investment_id = :investment_id AND portfolio_id = :portfolio_id
INSERT INTO holdings (portfolio_id, investment_id, average_cost_basis, date_updated, number_shares)

--End Point: /portfolios/:id/addinvestment - Managed Investment Holding
INSERT INTO holdings (portfolio_id, investment_id, average_cost_basis, date_updated, number_shares)
  SELECT portfolio_id, :investment_id, :average_cost_basis, NOW(), :number_shares FROM users
    INNER JOIN portfolios ON users.user_id = portfolios.user_id
  WHERE users.user_id = :user_id AND portfolio_id = :portfolio_id

--Server Side Scripts:
--Create Investment Type 
-- This is triggered and executed by the server only.  Users will not be able to directly add or update investment types.
INSERT INTO investmenttypes (api_code, investmenttype_name) VALUES (:api_code, :investmenttype_name);

--Determine Current Sectors
--This is part of the server side script used to automatically update sector detail.
SELECT sector_id, sector_name FROM sectors

--Determine if security exists
--This is part of the server side script used to automatically update investments from API.
SELECT investment_id, symbol, price_date 
  FROM investments
  WHERE user_id IS NULL AND symbol = :user_id

--Determine sector's ID
--This is part of the server side script used to automatically update investments from API.
SELECT sector_id FROM sectors WHERE sector_name = :sector_name

--Insert New Investment From API
--This is part of the server side script used to automatically update investments from API.
INSERT INTO investments (symbol, investment_name, latest_closing_price, price_date, sector_id, investmenttype_id)
  VALUES (:symbol, :investment_name, :latest_closing_price, :price_date, 
    (SELECT sector_id FROM sectors WHERE sector_name = :sector_name LIMIT 1),
    (SELECT investmenttype_id FROM investmenttypes WHERE api_code = :api_code LIMIT 1));

--Insert New Sectors
--This is part of the server side script used to automatically update sector detail.
-- This is triggered and executed by the server only.  Users will not be able to directly add or update sectors.
INSERT INTO sectors (sector_name) VALUES (:sector_value)

--Determine Prices To Update
--This is part of the server side script used to automatically update investment prices after market close.
SELECT investment_id, symbol, price_date 
  FROM investments
  WHERE user_id IS NULL AND price_date < NOW() - INTERVAL 1 DAY

--Update Investment Price
--This is part of the server side script used to automatically update investment prices after market close.
UPDATE investments
  SET investment_name = :investment_name, latest_closing_price = :latest_closing_price, price_date = :price_date, investmenttype_id = (SELECT investmenttype_id FROM investmenttypes WHERE api_code = :api_code LIMIT 1)
  WHERE investment_id = :investment_id;