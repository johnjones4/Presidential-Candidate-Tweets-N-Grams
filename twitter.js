var oauth = new OAuth.OAuth(
  'https://api.twitter.com/oauth/request_token',
  'https://api.twitter.com/oauth/access_token',
  'your application consumer key',
  'your application secret',
  '1.0A',
  null,
  'HMAC-SHA1'
);

exports.getHandles = function() {
  
}