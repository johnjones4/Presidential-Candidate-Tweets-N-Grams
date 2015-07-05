var mysql = require('mysql');
var config = require('./config');

var connection = mysql.createConnection(config.mysql);

exports.connect = function(callback) {
  connection.connect(callback);
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

exports.updateMemberLastTweet = function(id,max_id_str,callback) {
  connection.query('UPDATE Member SET LastTweet=? WHERE ID=?', [max_id_str,id], function(err, result) {
    callback(err);
  });
}

exports.createOfUpdateIssueCount = function(id,issue,count,callback) {
  var now = new Date();
  var month = now.getMonth()+1;
  if (month < 10) {
    month = '0' + month;
  }
  var day = now.getDate();
  if (day < 10) {
    day = '0' + day;
  }
  var daystamp = now.getFullYear() + '-' + month + '-' + day;
  connection.query('SELECT ID,Count FROM `MemberTotals` WHERE `Day` = ? AND `Issue` = ? AND `Member_ID` = ?', [daystamp,issue,id], function (error, results, fields) {
    if (error) {
      console.log(error);
      callback(err);
    }
    if (results && results.length > 0) {
      connection.query('UPDATE MemberTotals SET Count=? WHERE ID=?', [results[0]['Count']+count,results[0]['ID']], function(err, result) {
        callback(err);
      });
    } else {
      connection.query('INSERT INTO MemberTotals SET ?', {'Day': daystamp, 'Member_ID': id, 'Issue': issue, 'Count': count}, function(err, result) {
        if (err) {
          console.log(err);
        }
      });
    }
  });
}