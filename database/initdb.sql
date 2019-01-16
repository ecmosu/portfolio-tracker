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
  CONSTRAINT `holdings_ibfk_1` FOREIGN KEY (`portfolio_id`) REFERENCES `portfolios` (`portfolio_id`),
  CONSTRAINT `holdings_ibfk_2` FOREIGN KEY (`investment_id`) REFERENCES `investments` (`investment_id`)
) ENGINE = InnoDB;