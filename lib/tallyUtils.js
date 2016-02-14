var mongoose = require('mongoose');
var _ = require('lodash');
var async = require('async');

exports.tally = function(start,end,extraParams,callback) {
  Tweet = mongoose.model('Tweet');
  Issue = mongoose.model('Issue');
  var params = {
    'created': {
      '$gte': start,
      '$lte': end
    }
  };
  for(var p in extraParams) {
    params[p] = extraParams[p];
  }
  Tweet
    .find(params)
    .exec(function(err,tweets) {
      if (err) {
        callback(err);
      } else {
        var issuesMap = {};
        tweets.forEach(function(tweet) {
          tweet.issues.forEach(function(issue) {
            if (issuesMap[issue]) {
              issuesMap[issue]++;
            } else {
              issuesMap[issue] = 1;
            }
          });
        });
        var issueIds = _.keys(issuesMap);
        async.parallel(
          issueIds.map(function(issue) {
            return function(next) {
              Issue.findById(issue,next);
            }
          }),
          function(err,issues) {
            if (err) {
              callback(err);
            } else {
              var issuesAndCounts = issues.map(function(issue) {
                var obj = issue.toObject();
                obj.tally = issuesMap[issue._id];
                return obj;
              });
              issuesAndCounts.sort(function(a,b) {
                return b.tally - a.tally;
              });
              callback(null,issuesAndCounts);
            }
          }
        );
      }
    });
}
