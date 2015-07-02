var twitter = require('./twitter');
var database = require('./database');

database.connect(function(err) {
  if (!err) {
    twitter.getHandles(function(err) {
      if (!err) {
        console.log('ready');
      } else {
        console.log(err);
      }
    });
  } else {
    console.log(err);
  }
})