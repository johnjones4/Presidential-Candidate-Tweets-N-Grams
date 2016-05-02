var config = require('./config');
var Handle = require('./models/handle');
var Tweet = require('./models/tweet');
var NGram = require('./models/nGram');
var async = require('async');
var express = require('express');
var logger = require('morgan');
var routes = require('./routes');

var knex = require('knex')({
  'client': 'mysql',
  'connection': config.mysql
});

Handle.knex = knex;
Tweet.knex = knex;
NGram.knex = knex;

var app = express();
app.use(express.static(__dirname + '/public'));
app.use(logger('combined'));

app.get('/api/ngram',routes.api.getNGrams);
app.get('/api/handle',routes.api.getHandles);
app.get('/api/handle/:id',routes.api.getHandle);

app.listen(config.express.port,config.express.host,function() {
  console.log('Server running.');
});
