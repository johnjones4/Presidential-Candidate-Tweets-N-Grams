var mongoose = require('mongoose');
var _ = require('lodash');
var async = require('async');
var tallyUtils = require('../lib/tallyUtils');

var schema = new mongoose.Schema({
  'name': String,
  'handle': {
    'type': String,
    'index': {
      'unique': true
    }
  },
  'lastTweet': String,
  'created': {
    'type': Date,
    'default': Date.now
  }
});

schema.statics.findOrCreateMember = function(handle,name,done) {
  var Member = mongoose.model('Member');
  Member.findOne({'handle': handle}, function(err,member) {
    if (err) {
      done(err);
    } else if (member) {
      done(null,member);
    } else {
      var newMember = new Member({
        'handle': handle,
        'name': name
      });
      newMember.save(function(err) {
        done(err,newMember);
      });
    }
  })
}

schema.methods.issuesTally = function(start,end,callback) {
  tallyUtils.tally(start,end,{'member': this._id},callback);
}

var Member = mongoose.model('Member',schema);

exports.getForAPI = function(req,res,next,id) {
  Member.findById(id,function(err,doc) {
    if (err) {
      next(err);
    } else if (doc) {
      req.member = doc;
      next();
    } else {
      res.sendStatus(404);
    }
  });
};
