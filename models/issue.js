var mongoose = require('mongoose');
var async = require('async');
var defaultIssues = require('../datasources/issues');
var resolution = require('../lib/resolution.js');
var tallyUtils = require('../lib/tallyUtils');

var schema = new mongoose.Schema({
  'name': {
    'type': String,
    'index': {
      'unique': true
    }
  },
  'created': {
    'type': Date,
    'default': Date.now
  }
});

schema.statics.initializeIssues = function(done) {
  Issue = mongoose.model('Issue');
  async.parallel(
    defaultIssues.map(function(issueName) {
      return function(next) {
        var issue = new Issue({
          'name': issueName
        });
        issue.save(function(err) {
          next(null,issue);
        });
      }
    }),
    function() {
      Issue
        .find()
        .exec(function(err,issues) {
          if (err) {
            done(err);
          } else {
            done(null,issues);
          }
        });
    }
  );
}

schema.statics.tally = function(start,end,callback) {
  tallyUtils.tally(start,end,{},callback);
}

schema.methods.timeSeriesTally = function(start,end,reso,callback) {
  Tweet = mongoose.model('Tweet');
  Issue = mongoose.model('Issue');
  var updatedStart = resolution.convertDateForResolution(start,reso);
  var updatedEnd = resolution.convertDateForResolution(end,reso);
  Tweet.collection.mapReduce(
    function() {
      if(this.created) {
        var year = reso >= resolutions.year ? this.created.getFullYear() : 0;
        var month = reso >= resolutions.month ? this.created.getMonth() : 0;
        var date = reso >= resolutions.day ? this.created.getDate() : 0;
        var hours = reso >= resolutions.hour ? this.created.getHours() : 0;
        var minutes = reso >= resolutions.minute ? this.created.getMinutes() : 0;
        var seconds = reso >= resolutions.second ? this.created.getSeconds() : 0;
        var date = new Date(year,month,date,hours,minutes,seconds);
        emit(date.getTime(),1);
      }
    },
    function(key, values) {
      return Array.sum(values);
    },
    {
      'query': {
        'issues': this._id,
        'created': {
          '$gte': updatedStart,
          '$lte': updatedEnd
        }
      },
      'sort': {'_id': 1},
      'out': { 'inline': 1 },
      'scope': {
        'reso': reso,
        'resolutions': resolution.resolution
      }
    },
    function(err,found) {
      if (err) {
        callback(err);
      } else {
        var map = {};
        found.forEach(function(row) {
          map[row._id] = row.value;
        });
        var step = resolution.millisInResultion(reso);
        var output = [];
        for(var time = updatedStart.getTime(); time <= updatedEnd.getTime(); time += step) {
          var obj = {
            'date': time,
            'count': 0
          };
          if (typeof map[time] !== 'undefined') {
            obj.count = map[time];
          }
          output.push(obj);
        }
        callback(null,output);
      }
    }
  );
}

var Issue = mongoose.model('Issue',schema);

exports.getForAPI = function(req,res,next,id) {
  Issue.findById(id,function(err,doc) {
    if (err) {
      next(err);
    } else if (doc) {
      req.issue = doc;
      next();
    } else {
      res.sendStatus(404);
    }
  });
};
