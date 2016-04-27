var Handle = require('../models/handle');
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

exports.getHandles = function(req,res,next) {
  Handle.loadAll(function(err,handles) {
    if (err) {
      next(err);
    } else {
      res.send(handles);
    }
  });
};

exports.getHandle = function(req,res,next) {
  async.waterfall([
    function(next) {
      Handle.load(req.params.id,next);
    },
    function(handle,next) {
      var ngramIds = req.query.ngrams ? req.query.ngrams.split(',') : null;
      handle.loadNGrams(ngramIds,next);
    }
  ],function(err,handle) {
    if (err) {
      next(err);
    } else {
      res.send(handle);
    }
  });
};
