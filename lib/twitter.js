"use strict";

var OAuth = require('oauth').OAuth;
var querystring = require('querystring');
var async = require('async');
var _ = require('lodash');
var Handle = require('../models/handle');
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

  scan(done) {
    var _this = this;
    async.waterfall([
      function(next) {
        _this.getHandles(function(err) {
          next(err);
        });
      },
      function(next) {
        _this.getNewTweets(function(err) {
          next(err);
        });
      }
    ],done);
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

  getNewTweets(done) {
    var _this = this;
    async.waterfall([
      function(next) {
        var handle = _this.pingQueue[(_this.pingQueuePointer++) % _this.pingQueue.length];
        Handle.findOrCreateHandle(handle,_this.handles[handle],function(err,handle) {
          next(err,handle);
        });
      },
      function(handle,next) {
        if (_this.config.logging) console.log('Getting tweets for ' + handle.handle);
        var params = {
          'q': 'from:@'+handle.handle,
          'count': 1,
          'result_type': 'recent'
        };
        if (handle.lastTweet) {
          params.since_id = handle.lastTweet;
        }
        var url = 'https://api.twitter.com/1.1/search/tweets.json?' + querystring.stringify(params);
        _this.twitter.get(url,_this.config.twitter.token,_this.config.twitter.token_secret,function (e, data, res) {
          if (e) {
            next(e);
          } else {
            try {
              var response = JSON.parse(data);
              next(null,response,handle);
            } catch(e) {
              next(e);
            }
          }
        });
      },
      function(response,handle,next) {
        if (response.search_metadata && response.search_metadata.max_id_str) {
          handle.lastTweet = response.search_metadata.max_id_str;
          handle.save(function(err) {
            next(err,response,handle);
          });
        } else {
          next(null,response,handle);
        }
      },
      function(response,handle,next) {
        var statuses = response.statuses || [];
        var nextScan = function(params) {
          var url = 'https://api.twitter.com/1.1/search/tweets.json' + params;
          _this.twitter.get(url,_this.config.twitter.token,_this.config.twitter.token_secret,function (e, data, res) {
            if (e) {
              next(e);
            } else {
              try {
                var response = JSON.parse(data);
                if (response && response.statuses) {
                  statuses = statuses.concat(response.statuses);
                }
                if (response && response.search_metadata && response.search_metadata.next_results) {
                  nextScan(response.search_metadata.next_results);
                } else {
                  next(null,statuses,handle);
                }
              } catch(e) {
                next(e);
              }
            }
          });
        }
        if (response && response.search_metadata && response.search_metadata.next_results) {
          nextScan(response.search_metadata.next_results);
        } else {
          next(null,statuses,handle);
        }
      },
      function(statuses,handle,next) {
        if (statuses) {
          var tweets = statuses
            .map(function(status) {
              var tweet = new Tweet();
              tweet.handle = handle.id;
              tweet.text = status.text.replace(/[^\x00-\x7F]/g, "");
              tweet.twitterId = status.id_str;
              tweet.tweetDate = new Date(Date.parse(status.created_at.replace(/( \+)/, ' UTC$1')));
              tweet.findNGrams()
              return tweet;
            });
          next(null,handle,tweets);
        } else {
          next();
        }
      }
    ],function(err,handle,tweets) {
      if (err) {
        done(err);
      } else if (tweets) {
        async.series(
          tweets.map(function(tweet) {
            return function(next) {
              tweet.save(function(err) {
                next(err,tweet);
              })
            }
          }),
          function(err,tweets) {
            if (tweets) {
              if (_this.config.logging) console.log('Parsed ' + tweets.length + ' tweets for ' + handle.handle);
            }
            done(err);
          }
        )
      }
    });
  }
}

module.exports = Twitter;
