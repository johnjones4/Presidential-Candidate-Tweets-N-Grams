var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  'twitterId': {
    'type': String,
    'index': {
      'unique': true
    }
  },
  'text': String,
  'member': {
    'type': mongoose.Schema.Types.ObjectId,
    'ref': 'Member'
  },
  'issues': [
    {
      'type': mongoose.Schema.Types.ObjectId,
      'ref': 'Issue'
    }
  ],
  'created': {
    'type': Date,
    'default': Date.now
  }
});

var Tweet = mongoose.model('Tweet',schema);
