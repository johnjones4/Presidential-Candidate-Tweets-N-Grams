var twitter = require('./twitter');
var database = require('./database');

database.connect(function(err) {
  if (!err) {
    twitter.getHandles(function(err) {
      if (!err) {
        setInterval(function() {
          twitter.getNewTweets();
        },6000);
      } else {
        console.log(err);
      }
    });
  } else {
    console.log(err);
  }
})