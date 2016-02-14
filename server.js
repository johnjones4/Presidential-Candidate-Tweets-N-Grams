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

app.get('/api/issue',routes.api.issues);
app.get('/api/issue/:issue',routes.api.issue);
app.get('/api/member',routes.api.members);
app.get('/api/member/:member',routes.api.member);

app.listen(config.express.port,function() {
  console.log('Server running.');
});
