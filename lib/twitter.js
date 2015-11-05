var OAuth = require('oauth').OAuth;
var querystring = require('querystring');
var config = require('../config');
var database = require('./database');
var twitter = new OAuth(
  'https://api.twitter.com/oauth/request_token',
  'https://api.twitter.com/oauth/access_token',
  config.twitter.consumer_key,
  config.twitter.consumer_secret,
  '1.0A',
  null,
  'HMAC-SHA1'
);

var handles = {};
var pingQueue = [];
var pingQueuePointer = 0;

exports.getHandles = function(callback) {
  var url = 'https://api.twitter.com/1.1/lists/members.json?' + querystring.stringify({
    'slug': 'members-of-congress',
    'owner_screen_name': 'cspan',
    'count': 5000
  });
  twitter.get(url,config.twitter.token,config.twitter.token_secret,function (e, data, res) {
    if (e) {
      callback(e);
    } else {
      var response = JSON.parse(data);
      if (response && response.users) {
        var _handles = {};
        var _pingQueue = [];
        response.users.forEach(function(user) {
          _handles[user.screen_name] = user.name;
          _pingQueue.push(user.screen_name);
        });
        handles = _handles;
        pingQueue = _pingQueue;
        callback(null,_handles);
      } else {
        callback(respose,null);
      }
    }
  });
}

exports.getNewTweets = function(issues) {
  var handle = pingQueue[(pingQueuePointer++) % pingQueue.length];
  database.getOrCreateMember(handle,function(id,lastTweet) {
    var params = {
      'q': 'from:@'+handle,
      'count': 100
    };
    if (lastTweet) {
      params.since_id = lastTweet;
    }
    var url = 'https://api.twitter.com/1.1/search/tweets.json?' + querystring.stringify(params);
    twitter.get(url,config.twitter.token,config.twitter.token_secret,function (e, data, res) {
      if (e) {
        console.log(e);
      } else {
        var response = JSON.parse(data);
        if (response) {
          if (response.search_metadata && response.search_metadata.max_id_str) {
            database.updateMemberLastTweet(id,response.search_metadata.max_id_str,function(err) {
              if (err) console.log(err);
            });
          }
          if (response.statuses) {
            var issueCounts = {};
            var setsOfIssues = response.statuses.forEach(function(tweet) {
              issues.forEach(function(issue) {
                if (tweet.text.toLowerCase().indexOf(issue.Name.toLowerCase()) >= 0) {
                  if (!issueCounts[issue.ID]) {
                    issueCounts[issue.ID] = 1;
                  } else {
                    issueCounts[issue.ID]++;
                  }
                }
              });
            });
            for(var issue in issueCounts) {
              database.createOrUpdateIssueCount(id,issue,issueCounts[issue],function(err) {
                if (err) console.log(err);
              });
            }
          }
        }
      }
    });
  })
}
