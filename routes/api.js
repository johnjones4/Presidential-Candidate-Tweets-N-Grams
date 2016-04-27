var Member = require('../models/member');
var Tweet = require('../models/tweet');
var NGram = require('../models/nGram');
var async = require('async');

exports.getNGrams = function(req,res,next) {
  NGram.loadAll(function(err,ngrams) {
    if (err) {
      next(err);
    } else {
      res.send(ngrams);
    }
  })
};

exports.getMembers = function(req,res,next) {
  Member.loadAll(function(err,members) {
    if (err) {
      next(err);
    } else {
      res.send(members);
    }
  });
};

exports.getMember = function(req,res,next) {
  async.waterfall([
    function(next) {
      Member.load(req.params.id,next);
    },
    function(member,next) {
      var ngramIds = req.query.ngrams ? req.query.ngrams.split(',') : null;
      member.loadNGrams(ngramIds,next);
    }
  ],function(err,member) {
    if (err) {
      next(err);
    } else {
      res.send(member);
    }
  });
};
