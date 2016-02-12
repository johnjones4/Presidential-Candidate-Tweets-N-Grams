var config = require('./config.json');
var express = require('express');
var bodyParser = require('body-parser');
var logger = require('morgan');
var models = require('./models');
var mongoose = require('mongoose');
var routes = require('./routes');

mongoose.connect(config.mongo.connection_string);

var app = express();
app.use(logger('combined'));
app.use(bodyParser.json({}));

['issue','member','tweet'].forEach(function(param) {
  app.param(param,models[param].getForAPI);
})

app.get('/api/issue/:issue/tallies',routes.api.issuesTally);

app.listen(config.express.port,function() {
  console.log('Server running.');
});
