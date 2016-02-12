var mongoose = require('mongoose');

exports.issuesTally = function(req,res,next) {
  var Issue = mongoose.model('Issue');
  if (req.query.start && req.query.end && req.query.resolution) {
    var start = new Date(req.query.start);
    var end = new Date(req.query.end);
    var resolution = Issue.resolution[req.query.resolution];
    req.issue.timeSeriesTally(start,end,resolution,function(err,tallies) {
      if (err) {
        next(err);
      } else {
        res.send(tallies);
      }
    });
  } else {
    res.send(400);
  }
}
