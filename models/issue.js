var mongoose = require('mongoose');
var async = require('async');
var defaultIssues = require('../datasources/issues');

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
  Issue
    .find()
    .exec(function(err,issues) {
      if (err) {
        done(err);
      } else if (issues && issues.length > 0) {
        done(null,issues);
      } else {
        async.parallel(
          defaultIssues.map(function(issueName) {
            return function(next) {
              var issue = new Issue({
                'name': issueName
              });
              issue.save(function(err) {
                next(err,issue);
              });
            }
          }),
          done
        );
      }
    });
}

schema.statics.resolution = {
  'year': 0,
  'month': 1,
  'day': 2,
  'hour': 3,
  'minute': 4,
  'second': 5
};

schema.statics.millisInResultion = function(resolution) {
  switch (resolution) {
    case schema.statics.resolution.year:
      return 31540000000;
    case schema.statics.resolution.month:
      return 2628000000;
    case schema.statics.resolution.day:
      return 86400000;
    case schema.statics.resolution.hour:
      return 3600000;
    case schema.statics.resolution.minute:
      return 60000;
    case schema.statics.resolution.second:
      return 1000;
    default:
      return 1;
  }
}

schema.statics.convertDateForResolution = function(oldDate,resolution) {
  Issue = mongoose.model('Issue');
  var year = resolution >= Issue.resolution.year ? oldDate.getFullYear() : 0;
  var month = resolution >= Issue.resolution.month ? oldDate.getMonth() : 0;
  var date = resolution >= Issue.resolution.day ? oldDate.getDate() : 0;
  var hours = resolution >= Issue.resolution.hour ? oldDate.getHours() : 0;
  var minutes = resolution >= Issue.resolution.minute ? oldDate.getMinutes() : 0;
  var seconds = resolution >= Issue.resolution.second ? oldDate.getSeconds() : 0;
  return new Date(year,month,date,hours,minutes,seconds);
}

schema.methods.timeSeriesTally = function(start,end,resolution,callback) {
  Tweet = mongoose.model('Tweet');
  Issue = mongoose.model('Issue');
  var updatedStart = Issue.convertDateForResolution(start,resolution);
  var updatedEnd = Issue.convertDateForResolution(end,resolution);
  console.log(updatedStart,updatedEnd)
  Tweet.collection.mapReduce(
    function() {
      if(this.created) {
        var year = resolution >= resolutions.year ? this.created.getFullYear() : 0;
        var month = resolution >= resolutions.month ? this.created.getMonth() : 0;
        var date = resolution >= resolutions.day ? this.created.getDate() : 0;
        var hours = resolution >= resolutions.hour ? this.created.getHours() : 0;
        var minutes = resolution >= resolutions.minute ? this.created.getMinutes() : 0;
        var seconds = resolution >= resolutions.second ? this.created.getSeconds() : 0;
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
        'resolution': resolution,
        'resolutions': Issue.resolution
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
        var step = Issue.millisInResultion(resolution);
        var output = [];
        console.log(map)
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
