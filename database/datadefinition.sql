DROP TABLE IF EXISTS `holdings`;
DROP TABLE IF EXISTS `portfolios`;
DROP TABLE IF EXISTS `investments`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `investmenttypes`;
DROP TABLE IF EXISTS `sectors`;

CREATE TABLE `users` (
  `user_id` INT(11) NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(25) NOT NULL,
  `password_hash` BINARY(60) NOT NULL,
  `last_login` TIMESTAMP on update CURRENT_TIMESTAMP NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB;

CREATE TABLE `portfolios` ( 
  `portfolio_id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL,
  `portfolio_name` VARCHAR(100) NOT NULL, 
  PRIMARY KEY (`portfolio_id`),
  CONSTRAINT `portfolio_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE = InnoDB;


CREATE TABLE `investmenttypes` ( 
  `investmenttype_id` INT(11) NOT NULL AUTO_INCREMENT,
  `api_code` VARCHAR(10) DEFAULT NULL,
  `investmenttype_name` VARCHAR(100) NOT NULL, 
  PRIMARY KEY (`investmenttype_id`)
) ENGINE = InnoDB;

CREATE TABLE `sectors` ( 
  `sector_id` INT(11) NOT NULL AUTO_INCREMENT,
  `sector_name` VARCHAR(100) NOT NULL, 
  PRIMARY KEY (`sector_id`)
) ENGINE = InnoDB;

CREATE TABLE `investments` ( 
  `investment_id` INT(11) NOT NULL AUTO_INCREMENT,
  `symbol` VARCHAR(50) DEFAULT NULL,
  `investment_name` VARCHAR(250) NOT NULL,
  `latest_closing_price` DECIMAL(9, 2) DEFAULT 0,
  `price_date` TIMESTAMP NOT NULL,
  `investmenttype_id` INT(11) NOT NULL, 
  `sector_id` INT(11) DEFAULT NULL, 
  `user_id` INT(11) DEFAULT NULL, 
  PRIMARY KEY (`investment_id`),
  CONSTRAINT `investments_ibfk_1` FOREIGN KEY (`investmenttype_id`) REFERENCES `investmenttypes` (`investmenttype_id`),
  CONSTRAINT `investments_ibfk_2` FOREIGN KEY (`sector_id`) REFERENCES `sectors` (`sector_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `investments_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB;

CREATE TABLE `holdings` ( 
  `portfolio_id` INT(11) NOT NULL,
  `investment_id` INT(11) NOT NULL,
  `average_cost_basis` DECIMAL(12, 2) DEFAULT 0,
  `number_shares` DECIMAL(12, 5) DEFAULT 0,
  `date_updated` TIMESTAMP on update CURRENT_TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
  PRIMARY KEY (`portfolio_id`, `investment_id`),
  CONSTRAINT `holdings_ibfk_1` FOREIGN KEY (`portfolio_id`) REFERENCES `portfolios` (`portfolio_id`) ON DELETE CASCADE,
  CONSTRAINT `holdings_ibfk_2` FOREIGN KEY (`investment_id`) REFERENCES `investments` (`investment_id`) ON DELETE CASCADE
) ENGINE = InnoDB;

INSERT INTO users (username, password_hash) VALUES ('TestUser', '$2b$10$an7Mdvqxap5FlWLdz279RuaRSUiLg/PiWYCGu/G/20UBSiKDc5FnK');
INSERT INTO portfolios (portfolio_name, user_id) VALUES ('401K', 1);
INSERT INTO portfolios (portfolio_name, user_id) VALUES ('Roth', 1);
INSERT INTO portfolios (portfolio_name, user_id) VALUES ('Taxable', 1);
INSERT INTO investmenttypes (api_code, investmenttype_name) VALUES ('USER', 'User Investment');
INSERT INTO investmenttypes (api_code, investmenttype_name) VALUES ('N/A', 'Unclassified');
INSERT INTO investmenttypes (api_code, investmenttype_name) VALUES ('AD', 'American Depository Receipt (ADR)');
INSERT INTO investmenttypes (api_code, investmenttype_name) VALUES ('RE', 'Real Estate Investment Trust (REIT)');
INSERT INTO investmenttypes (api_code, investmenttype_name) VALUES ('CE', 'Closed End Fund (Stock and Bond Fund)');
INSERT INTO investmenttypes (api_code, investmenttype_name) VALUES ('SI', 'Secondary Issue');
INSERT INTO investmenttypes (api_code, investmenttype_name) VALUES ('LP', 'Limited Partnerships');
INSERT INTO investmenttypes (api_code, investmenttype_name) VALUES ('CS', 'Common Stock');
INSERT INTO investmenttypes (api_code, investmenttype_name) VALUES ('ET', 'Exchange Traded Fund (ETF)');
INSERT INTO investments (symbol, investment_name, investmenttype_id, latest_closing_price, price_date)
  VALUES ('DIA', 'SPDR Dow Jones Industrial Average', 7, 251.32, NOW() - INTERVAL 7 DAY);
INSERT INTO investments (symbol, investment_name, investmenttype_id, latest_closing_price, price_date)
  VALUES ('SPY', 'SPDR S&P 500', 7, 251.32, NOW() - INTERVAL 7 DAY);
INSERT INTO holdings (portfolio_id, investment_id, average_cost_basis, date_updated, number_shares)
  VALUES (1, 1, 88, NOW(), 100);
INSERT INTO holdings (portfolio_id, investment_id, average_cost_basis, date_updated, number_shares)
  VALUES (1, 2, 199, NOW(), 200);
INSERT INTO holdings (portfolio_id, investment_id, average_cost_basis, date_updated, number_shares)
  VALUES (2, 1, 88, NOW(), 100);
INSERT INTO holdings (portfolio_id, investment_id, average_cost_basis, date_updated, number_shares)
  VALUES (2, 2, 199, NOW(), 200);
INSERT INTO holdings (portfolio_id, investment_id, average_cost_basis, date_updated, number_shares)
  VALUES (3, 1, 88, NOW(), 100);
INSERT INTO holdings (portfolio_id, investment_id, average_cost_basis, date_updated, number_shares)
  VALUES (3, 2, 199, NOW(), 200);

