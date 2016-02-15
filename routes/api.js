var mongoose = require('mongoose');
var Issue = mongoose.model('Issue');
var Member = mongoose.model('Member');
var resolution = require('../lib/resolution');

exports.issues = function(req,res,next) {
  if (req.query.start && req.query.end) {
    var start = new Date(parseInt(req.query.start));
    var end = new Date(parseInt(req.query.end));
    Issue.tally(start,end,function(err,issues) {
      if (err) {
        next(err);
      } else {
        res.send(issues);
      }
    });
  } else {
    Issue.find().exec(function(err,issues) {
      if (err) {
        next(err);
      } else {
        res.send(issues.map(function(issue) {
          return issue.toObject();
        }));
      }
    })
  }
};

exports.issue = function(req,res,next) {
  if (req.query.start && req.query.end && req.query.resolution) {
    var start = new Date(parseInt(req.query.start));
    var end = new Date(parseInt(req.query.end));
    var reso = resolution.resolution[req.query.resolution];
    req.issue.timeSeriesTally(start,end,reso,function(err,tallies) {
      if (err) {
        next(err);
      } else {
        var obj = req.issue.toObject();
        obj.tallies = tallies;
        res.send(obj);
      }
    });
  } else {
    var obj = req.issue.toObject();
    res.send(obj);
  }
};

exports.members = function(req,res,next) {
  Member
    .find()
    .sort({'name': 1})
    .exec(function(err,members) {
      if (err) {
        next(err);
      } else {
        res.send(members.map(function(member) {
          return member.toObject();
        }));
      }
    });
};

exports.member = function(req,res,next) {
  if (req.query.start && req.query.end) {
    var start = new Date(parseInt(req.query.start));
    var end = new Date(parseInt(req.query.end));
    req.member.issuesTally(start,end,function(err,tallies) {
      if (err) {
        next(err);
      } else {
        var obj = req.member.toObject();
        obj.tallies = tallies;
        res.send(obj);
      }
    });
  } else {
    var obj = req.member.toObject();
    res.send(obj);
  }
};
