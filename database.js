var mysql = require('mysql');
var config = require('./config');

const schema = 'CREATE TABLE IF NOT EXISTS `congtrack`.`Member` (   `ID` INT NOT NULL AUTO_INCREMENT,   `Handle` VARCHAR(5) NOT NULL,   `LastTweet` VARCHAR(45) NULL,   PRIMARY KEY (`ID`)) ENGINE = InnoDB;  CREATE TABLE IF NOT EXISTS `congtrack`.`MemberTotals` (   `ID` INT UNSIGNED NOT NULL AUTO_INCREMENT,   `Member_ID` INT NOT NULL,   `Issue` VARCHAR(255) NOT NULL,   `Count` INT UNSIGNED NOT NULL DEFAULT 0,   PRIMARY KEY (`ID`, `Member_ID`),   UNIQUE INDEX `id_UNIQUE` (`ID` ASC),   INDEX `ISSUE` (`Issue` ASC),   INDEX `fk_MemberTotals_Member_idx` (`Member_ID` ASC),   CONSTRAINT `fk_MemberTotals_Member`     FOREIGN KEY (`Member_ID`)     REFERENCES `congtrack`.`Member` (`ID`)     ON DELETE NO ACTION     ON UPDATE NO ACTION) ENGINE = InnoDB;'

var connection = mysql.createConnection(config.mysql);

exports.connect = function(callback) {
  connection.connect(function(err){
    if (err) {
      callback(err);
    } else {
      callback();
    }
  });
}

exports.install = function(callback) {
  connection.query(schema,callback);
}

exports.getOrCreateMember = function(handle,callback) {
  connection.query('SELECT ID,LastTweet FROM `Member` WHERE `Handle` = ?', [handle], function (error, results, fields) {
    if (error) {
      callback(err);
    }
    if (results && results.length > 0) {
      callback(results[0]['ID'],results[0]['LastTweet']);
    } else {
      connection.query('INSERT INTO Member SET ?', {'Handle': handle}, function(err, result) {
        if (result) {
          callback(result.insertId);
        } else {
          console.log(err);
        }
      });
    }
  });
}

exports.updateMemberLastTweet = function(id,max_id_str) {
  connection.query('UPDATE Member SET LastTweet=? WHERE ID=?', [max_id_str,id], function(err, result) {
    callback(err);
  });
}

exports.createOfUpdateIssueCount = function(id,issue,count,callback) { //function(err) {
  connection.query('SELECT ID,Count FROM `MemberTotals` WHERE `Issue` = ? AND `Member_ID` = ?', [issue,id], function (error, results, fields) {
    if (error) {
      console.log(error);
      callback(err);
    }
    if (results && results.length > 0) {
      connection.query('UPDATE MemberTotals SET Count=? WHERE ID=?', [results[0]['Count']+count,results[0]['ID']], function(err, result) {
        callback(err);
      });
    } else {
      connection.query('INSERT INTO MemberTotals SET ?', {'Member_ID': id, 'Issue': issue, 'Count': count}, function(err, result) {
        if (err) {
          console.log(err);
        }
      });
    }
  });
}