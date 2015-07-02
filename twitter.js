var OAuth = require('oauth').OAuth;
var querystring = require('querystring');
var config = require('./config');
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

exports.getHandles = function(callback) {
  var url = 'https://api.twitter.com/1.1/lists/members.json?' + querystring.stringify({
    'slug': 'members-of-congress',
    'owner_screen_name': 'cspan',
    'count': 5000
  });
  twitter.get(url,config.twitter.token,config.twitter.token_secret,function (e, data, res) {
    if (e) {
      console.log(e);
      callback();
    } else {
      var response = JSON.parse(data);
      if (response && response.users) {
        var _handles = {};
        response.users.forEach(function(user) {
          _handles[user.screen_name] = user.name;
        });
        handles = _handles;
        callback(null,_handles);
      } else {
        callback(respose,null);
      }
    }
  });
}