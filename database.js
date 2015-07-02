var mysql = require('mysql');
var config = require('./config');

const schema = 'CREATE TABLE IF NOT EXISTS `MemberTotals` (`id` INT UNSIGNED NOT NULL AUTO_INCREMENT, `handle` VARCHAR(16) NOT NULL, `issue` VARCHAR(255) NOT NULL, `count` INT UNSIGNED NOT NULL DEFAULT 0, PRIMARY KEY (`id`), UNIQUE INDEX `id_UNIQUE` (`id` ASC), INDEX `HANDLE` (`handle` ASC), INDEX `ISSUE` (`issue` ASC)) ENGINE = InnoDB;'

var connection = mysql.createConnection(config.mysql);

exports.connect = function(callback) {
  connectio n.connect(function(err){
    callback(err);
  });
}

exports.install = function(callback) {
  connection.query(schema,callback);
}