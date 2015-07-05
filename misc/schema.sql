DROP SCHEMA IF EXISTS `congtrack`;

CREATE SCHEMA `congtrack`;

DROP TABLE IF EXISTS `congtrack`.`Member` ;

CREATE TABLE IF NOT EXISTS `congtrack`.`Member` (
  `ID` INT NOT NULL AUTO_INCREMENT,
  `Handle` VARCHAR(15) NOT NULL,
  `LastTweet` VARCHAR(45) NULL,
  PRIMARY KEY (`ID`))
ENGINE = InnoDB;

DROP TABLE IF EXISTS `congtrack`.`MemberTotals` ;

CREATE TABLE IF NOT EXISTS `congtrack`.`MemberTotals` (
  `ID` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `Member_ID` INT NOT NULL,
  `Issue` VARCHAR(255) NOT NULL,
  `Count` INT UNSIGNED NOT NULL DEFAULT 0,
  `Day` DATE NOT NULL,
  PRIMARY KEY (`ID`, `Member_ID`),
  UNIQUE INDEX `id_UNIQUE` (`ID` ASC),
  INDEX `ISSUE` (`Issue` ASC),
  INDEX `fk_MemberTotals_Member_idx` (`Member_ID` ASC),
  CONSTRAINT `fk_MemberTotals_Member`
    FOREIGN KEY (`Member_ID`)
    REFERENCES `congtrack`.`Member` (`ID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;
