-- Register
INSERT INTO users (username, password_hash) VALUES (:usernameInput, :passwordInputHashed);

-- Login, check that entered data exists.  Returned hash will be compared to the provided password to authenticate via the bcrypt library.
SELECT user_id, password_hash FROM users WHERE username = :usernameInput;

--Update User Login Time
UPDATE users SET last_login = NOW() WHERE user_id = :user_id

-- Add portfolio
INSERT INTO portfolios (user_id, portfolio_name) VALUES (:user_id, :portfolioNameInput);

-- Update Portfolio
UPDATE portfolios SET portfolio_name = :new_portfolio_name
  WHERE portfolio_id = :portfolio_id AND user_id = :user_id;

-- View('Select') portfolio
SELECT SELECT investments.investment_id, investments.symbol, investments.investment_name, 
  investments.latest_closing_price as latest_price, investments.latest_closing_price, holdings.average_cost_basis, 
  holdings.number_shares, investments.price_date, holdings.date_updated
FROM investments 
  INNER JOIN holdings ON investments.investment_id = holdings.investment_id 
  INNER JOIN portfolios ON holdings.portfolio_id =  portfolios.portfolio_id 
WHERE portfolios.user_id = :user_id AND portfolios.portfolio_id = :portfolio_id;

-- Delete portfolio
DELETE FROM portfolios WHERE portfolio_id = :portfolio_id AND user_id = :user_id;

-- Delete individual holding
DELETE FROM holdings WHERE portfolio_id = :portfolio_id AND investment_id = :investment_id

--Create Sector - This is triggered and executed by the server only.  Users will not be able to directly add or update sectors.
INSERT INTO sectors (sector_name) VALUES (:sector_name);

--Create Investment Type - This is triggered and executed by the server only.  Users will not be able to directly add or update investment types.
INSERT INTO investmenttypes (api_code, investmenttype_name) VALUES (:api_code, :investmenttype_name);

--Add investment 
INSERT INTO investments (symbol, investment_name, investmenttype_id, latest_closing_price, sector_id)
  VALUES (:symbol, :investment_name, :investmenttype_id, :latest_closing_price, :sector_id);

--Update Investment Price
UPDATE investments
  SET latest_closing_price = :latest_closing_price
  WHERE investment_id = :investment_id;

--Delete Investment
DELETE FROM holdings WHERE WHERE investment_id = :investment_id;
DELETE FROM investments WHERE investment_id = :investment_id AND user_id = :user_id;

--Update Holding
UPDATE holdings 
SET average_cost_basis = :average_cost_basis, 
  number_shares = :number_shares,
  date_updated = NOW()
WHERE portfolio_id = :portfolio_id AND investment_id = :investment_id;

--Create New Holding
INSERT INTO holdings (portfolio_id, investment_id, average_cost_basis, date_updated, number_shares)
  VALUES (:portfolio_id, :investment_id, :average_cost_basis, NOW(), :number_shares);