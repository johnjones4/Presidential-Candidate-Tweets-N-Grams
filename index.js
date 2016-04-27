var config = require('./config');
var Member = require('./models/member');
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

Member.knex = knex;
Tweet.knex = knex;
NGram.knex = knex;

var app = express();
app.use(express.static(__dirname + '/public'));
app.use(logger('combined'));

app.get('/api/ngram',routes.api.getNGrams);
app.get('/api/member',routes.api.getMembers);
app.get('/api/member/:id',routes.api.getMember);

app.listen(config.express.port,function() {
  console.log('Server running.');
});
