var database = require('../lib/database');
var async = require('async');

exports.getIssues = function(req,res,next) {
  async.waterfall([
    database.getIssues,
    function(issues,callback) {
      database.getTallies(null,null,function(err,tallies) {
        callback(err,issues,tallies);
      });
    },
    function(issues,tallies,callback) {
      issues.forEach(function(issue) {
        issue.tallies = tallies.filter(function(tally) {
          return tally.Issue_ID = issue.ID;
        });
      });
      callback(null,issues);
    }
  ],function(err,issues) {
    if (err) {
      next(err);
    } else {
      res.send(issues);
    }
  });
}

exports.getMembers = function(req,res,next) {
  async.waterfall([
    database.getMembers,
    function(members,callback) {
      database.getTallies(null,null,function(err,tallies) {
        callback(err,members,tallies);
      });
    },
    function(members,tallies,callback) {
      members.forEach(function(member) {
        member.tallies = tallies.filter(function(tally) {
          return tally.Member_ID = member.ID;
        });
      });
      callback(null,members);
    }
  ],function(err,members) {
    if (err) {
      next(err);
    } else {
      res.send(members);
    }
  });
}

exports.getTallies = function(req,res,next) {
  database.getTallies(null,null,function(err,tallies) {
    if (err) {
      next(err);
    } else {
      res.send(tallies);
    }
  });
}

exports.getCombinedTallies = function(req,res,next) {
  database.getCombinedTallies(null,null,function(err,tallies) {
    if (err) {
      next(err);
    } else {
      var minDate = Number.MAX_VALUE;
      var maxDate = 0;
      tallies.forEach(function(tally) {
        var day = tally.Day.getTime();
        if (day < minDate) {
          minDate = day;
        }
        if (day > maxDate) {
          maxDate = day;
        }
      });
      var output = [];
      var day = minDate;
      while(day <= maxDate) {
        var dateObj = new Date(day);
        output.push({
          'day': dateObj,
          'tallies': tallies.filter(function(tally) {
            return tally.Day.getFullYear() == dateObj.getFullYear() 
                    && tally.Day.getMonth() == dateObj.getMonth() 
                    && tally.Day.getDate() == dateObj.getDate();
          })
        });
        day += 86400000;
      }
      res.send(output);
    }
  });
}

exports.getCombinedMembers = function(req,res,next) {
  async.waterfall([
    database.getMembers,
    function(members,callback) {
      database.getCombinedMemberTallies(null,null,function(err,tallies) {
        if (err) {
          callback(err);
        } else {
          callback(null,members,tallies)
        }
      })
    },
    function(members,tallies,callback) {
      members.forEach(function(member) {
        member.tallies = tallies.filter(function(tally) {
          return tally.Member_ID == member.ID;
        });
      });
      callback(null,members);
    }
  ],function(err,members) {
    if (err) {
      next(err);
    } else {
      res.send(members);
    }
  });
}