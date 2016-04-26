"use strict";

var OAuth = require('oauth').OAuth;
var querystring = require('querystring');
var async = require('async');
var _ = require('lodash');
var Member = require('../models/member');
var Tweet = require('../models/tweet');

class Twitter {
  constructor(config) {
    this.config = config;
    this.handles = {};
    this.pingQueue = [];
    this.pingQueuePointer = 0;
    this.twitter = new OAuth(
      'https://api.twitter.com/oauth/request_token',
      'https://api.twitter.com/oauth/access_token',
      config.twitter.consumer_key,
      config.twitter.consumer_secret,
      '1.0A',
      null,
      'HMAC-SHA1'
    );
  }

  start() {
    var _this = this;
    async.waterfall([
      function(next) {
        _this.getHandles(next);
      }
    ],function(err) {
      if (err) {
        console.error(err);
      } else {
        _this.interval = setInterval(function() {
          _this.getNewTweets();
        },6000);
      }
    })
  }

  stop() {
    clearInterval(_this.interval);
  }

  getHandles(callback) {
    var url = 'https://api.twitter.com/1.1/lists/members.json?' + querystring.stringify({
      'slug': 'presidential-candidates',
      'owner_screen_name': 'cspan',
      'count': 5000
    });
    var _this = this;
    _this.twitter.get(url,_this.config.twitter.token,_this.config.twitter.token_secret,function (e, data, res) {
      if (e) {
        callback(e);
      } else {
        try {
          var response = JSON.parse(data);
          if (response && response.users) {
            var _handles = {};
            var _pingQueue = [];
            response.users.forEach(function(user) {
              _handles[user.screen_name] = user.name;
              _pingQueue.push(user.screen_name);
            });
            _this.handles = _handles;
            _this.pingQueue = _pingQueue;
            callback(null,_handles);
          } else {
            callback(respose,null);
          }
        } catch(e) {
          callback(e);
        }
      }
    });
  }

  getNewTweets() {
    var _this = this;
    async.waterfall([
      function(next) {
        var handle = _this.pingQueue[(_this.pingQueuePointer++) % _this.pingQueue.length];
        Member.findOrCreateMember(handle,_this.handles[handle],function(err,member) {
          next(err,member);
        });
      },
      function(member,next) {
        if (_this.config.logging) console.log('Getting tweets for ' + member.handle);
        var params = {
          'q': 'from:@'+member.handle,
          'count': 100
        };
        if (member.lastTweet) {
          params.since_id = member.lastTweet;
        }
        var url = 'https://api.twitter.com/1.1/search/tweets.json?' + querystring.stringify(params);
        _this.twitter.get(url,_this.config.twitter.token,_this.config.twitter.token_secret,function (e, data, res) {
          if (e) {
            next(e);
          } else {
            try {
              var response = JSON.parse(data);
              next(null,response,member);
            } catch(e) {
              next(e);
            }
          }
        });
      },
      function(response,member,next) {
        if (response.search_metadata && response.search_metadata.max_id_str) {
          member.lastTweet = response.search_metadata.max_id_str;
          member.save(function(err) {
            next(err,response,member);
          });
        } else {
          next(null,response,member);
        }
      },
      function(response,member,next) {
        if (response.statuses) {
          var tweets = response.statuses
            .map(function(status) {
              var tweet = new Tweet();
              tweet.member = member.id;
              tweet.text = status.text.replace(/[^\x00-\x7F]/g, "");
              tweet.twitterId = status.id_str;
              tweet.tweetDate = new Date(Date.parse(status.created_at.replace(/( \+)/, ' UTC$1')));
              tweet.findNGrams()
              return tweet;
            });
          next(null,member,tweets);
        } else {
          next();
        }
      }
    ],function(err,member,tweets) {
      if (err) {
        console.error(err);
      }
      if (tweets) {
        async.series(
          tweets.map(function(tweet) {
            return function(next) {
              tweet.save(function(err) {
                next(err,tweet);
              })
            }
          }),
          function(err,tweets) {
            if (err) {
              console.error(err);
            }
            if (tweets) {
              if (_this.config.logging) console.log('Parsed ' + tweets.length + ' tweets for ' + member.handle);
            }
          }
        )
      }
    });
  }
}

module.exports = Twitter;
