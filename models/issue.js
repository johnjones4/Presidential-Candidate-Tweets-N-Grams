var mongoose = require('mongoose');
var async = require('async');
var defaultIssues = require('../datasources/issues');

var schema = new mongoose.Schema({
  'name': String,
  'created': {
    'type': Date,
    'default': Date.now
  }
});

schema.statics.initializeIssues = function(done) {
  Issue = mongoose.model('Issue');
  Issue
    .find()
    .exec(function(err,issues) {
      if (err) {
        done(err);
      } else if (issues && issues.length > 0) {
        done(null,issues);
      } else {
        async.parallel(
          defaultIssues.map(function(issueName) {
            return function(next) {
              var issue = new Issue({
                'name': issueName
              });
              issue.save(function(err) {
                next(err,issue);
              });
            }
          }),
          done
        );
      }
    });
}

var Issue = mongoose.model('Issue',schema);
