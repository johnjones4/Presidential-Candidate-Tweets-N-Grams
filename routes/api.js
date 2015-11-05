var database = require('../lib/database');
var async = require('async');

exports.getIssues = function(req,res,next) {
  async.waterfall([
    database.getIssues,
    function(issues,callback) {
      database.getTallies(null,null,function(err,tallies) {
        callback(err,issues,tallies);
      });
    }
  ],function(err,issues,tallies) {
    if (err) {
      next(err);
    } else {
      issues.forEach(function(issue) {
        issue.tallies = tallies.filter(function(tally) {
          return tally.Issue_ID = issue.ID;
        });
      });
      res.send(issues);
    }
  })
}

exports.getMembers = function(req,res,next) {
  async.waterfall([
    database.getMembers,
    function(members,callback) {
      database.getTallies(null,null,function(err,tallies) {
        callback(err,members,tallies);
      });
    }
  ],function(err,members,tallies) {
    if (err) {
      next(err);
    } else {
      members.forEach(function(member) {
        member.tallies = tallies.filter(function(tally) {
          return tally.Member_ID = member.ID;
        });
      });
      res.send(members);
    }
  })
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
