var mysql = require('mysql');
var config = require('../config');
var async = require('async');
var issues = require('../datasources/issues');

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

exports.createOrUpdateIssueCount = function(id,issue,count,callback) {
  var now = new Date();
  var daystamp = mysqlDate(now);
  connection.query('SELECT ID,Count FROM `Tally` WHERE `Day` = ? AND `Issue_ID` = ? AND `Member_ID` = ?', [daystamp,issue,id], function (error, results, fields) {
    if (error) {
      console.log(error);
      callback(err);
    }
    if (results && results.length > 0) {
      connection.query('UPDATE Tally SET Count=? WHERE ID=?', [results[0]['Count']+count,results[0]['ID']], function(err, result) {
        callback(err);
      });
    } else {
      connection.query('INSERT INTO Tally SET ?', {'Day': daystamp, 'Member_ID': id, 'Issue_ID': issue, 'Count': count}, function(err, result) {
        if (err) {
          console.log(err);
        }
      });
    }
  });
}

exports.setupIssues = function(callback) {
  async.parallel(
    issues.map(function(issue) {
      return function(callback) {
        connection.query('SELECT ID,Name FROM `Issue` WHERE `Name` = ?', [issue], function (error, results, fields) {
          if (error) {
            callback(error);
          } else if (results && results.length > 0) {
            callback(null,results[0]);
          } else {
            connection.query('INSERT INTO `Issue` SET ?', {'Name': issue}, function(err, result) {
              if (err) {
                callback(err);
              } else {
                callback(null,{
                  'ID': result.insertId,
                  'Name': issue
                });
              }
            });
          }
        });
      };
    }),callback);
}

exports.getIssues = function(callback) {
  connection.query('SELECT ID,Name FROM Issue ORDER BY Name', [], function(err,results,fields) {
    callback(err,results);
  });
}

exports.getMembers = function(callback) {
  connection.query('SELECT ID,Handle FROM Member ORDER BY Handle', [], function(err,results,fields) {
    callback(err,results);
  });
}

exports.getTallies = function(start,end,callback) {
  start = cleanDate(start,'0000-00-00');
  end = cleanDate(end,'9999-99-99');
  connection.query('SELECT t.ID,t.Member_ID,t.Issue_ID,t.Count,t.Day,m.Handle,i.Name FROM Tally t, Issue i, Member m WHERE t.Member_ID = m.ID AND t.Issue_ID = i.ID AND Day >= ? && Day <= ? ORDER BY t.Day, m.Handle, i.Name', [start,end], function(err,results,fields) {
    callback(err,results);
  });
}

exports.getCombinedTallies = function(start,end,callback) {
  start = cleanDate(start,'0000-00-00');
  end = cleanDate(end,'9999-99-99');
  connection.query('SELECT t.Issue_ID,t.Day,i.Name,sum(t.Count) as Count FROM Tally t, Issue i WHERE t.Issue_ID = i.ID AND Day >= ? && Day <= ? GROUP BY t.Issue_ID, t.Day', [start,end], function(err,results,fields) {
    callback(err,results);
  });
}

function cleanDate(date,def) {
  if (date) {
    return mysqlDate(date)
  } else {
    return def;
  }
}

function mysqlDate(date) {
  var month = date.getMonth()+1;
  if (month < 10) {
    month = '0' + month;
  }
  var day = date.getDate();
  if (day < 10) {
    day = '0' + day;
  }
  return date.getFullYear() + '-' + month + '-' + day;
}