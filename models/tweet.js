'use strict';

var Model = require('./model');
var NGram = require('./nGram');
var async = require('async');

class Tweet extends Model {
  constructor() {
    super();
    this.twitterId = null;
    this.text = null;
    this.handle = null;
    this.tweetDate = null;
  }

  save(done) {
    var data = {
      'twitterId': this.twitterId,
      'text': this.text,
      'handle': this.handle,
      'tweetDate': this.tweetDate
    };
    var _this = this;
    this._save(Tweet.knex('tweets'),data,function(err) {
      if (err) {
        done(err);
      } else {
        _this.saveNGrams(function(err) {
          done(err,_this);
        })
      }
    });
  }

  findNGrams() {
    var tokens = this.text.toLowerCase().split(' ');
    var nGrams = [];
    for(var N = 1; N < 5; N++) {
      for(var k=0; k<(tokens.length-N+1); k++) {
        var s = '';
        var start = k;
        var end = k + N;
        for(var j=start; j<end; j++) {
          s = s + ' ' + tokens[j];
        }
        var cleaned = s.trim().replace(/\b[-.,()&$#!\[\]{}"']+\B|\B[-.,()&$#!\[\]{}"']+\b/g, "").trim();
        if (cleaned.length > 0 && ['-','&amp;','https:/'].indexOf(cleaned) < 0) {
          nGrams.push(cleaned);
        }
      }
    }
    this.nGrams = nGrams;
  }

  saveNGrams(done) {
    var _this = this;
    var map = {};
    this.nGrams.forEach(function(nGram) {
      if (!map[nGram]) {
        map[nGram] = 0;
      }
      map[nGram]++;
    });
    var nGramArray = [];
    for(var nGram in map) {
      nGramArray.push({
        'nGram': nGram,
        'count': map[nGram]
      });
    }
    async.series(
      nGramArray.map(function(nGram) {
        return function(next) {
          NGram.findByNGram(nGram.nGram,function(err,nGramObject) {
            next(err,{
              'nGram': nGramObject,
              'count': nGram.count
            });
          });
        }
      }),
      function(err,nGramObjects) {
        if (err) {
          console.error(err);
        } else {
          async.parallel(
            nGramObjects.map(function(nGramObject) {
              return function(next) {
                Tweet
                  .knex('tweets_ngrams')
                  .insert({
                    'tweet': _this.id,
                    'ngram': nGramObject.nGram.id,
                    'count': nGramObject.count
                  })
                  .asCallback(next);
              }
            }),
            done
          )
        }
      }
    );
  }
}

Tweet.findByTwitterId = function(twitterId,done) {
  Tweet.knex
    .select('id','twitterId','text','handle','created_at','updated_at','tweetDate')
    .from('tweets')
    .where({
      'twitterId': twitterId
    })
    .asCallback(function(err,rows) {
      if (err) {
        done(err);
      } else if (rows.length > 0) {
        done(null,Tweet.generateObjects(rows)[0]);
      } else {
        done(null,null);
      }
    });
};

Tweet.generateObjects = function(rows) {
  return rows.map(function(row) {
    var tweet = new Tweet();
    tweet.id = row.id;
    tweet.twitterId = row.twitterId;
    tweet.text = row.text;
    tweet.handle = row.handle;
    tweet.tweetDate = row.tweetDate;
    tweet.created = row.created_at;
    tweet.updated = row.updated_at;
    return tweet;
  })
}

Tweet.generateTable = function(done) {
  async.series([
    function(next) {
      Tweet.knex.schema.hasTable('tweets').then(function(exists) {
        if (!exists) {
          Tweet.knex.schema.createTableIfNotExists('tweets', function (table) {
            table.increments('id').primary();
            table.string('twitterId').notNullable().unique();
            table.string('text').notNullable();
            table.integer('handle').unsigned().notNullable().references('id').inTable('handles');
            table.date('tweetDate');
            table.timestamps();
            table.index(['twitterId']);
          }).asCallback(next);
        } else {
          next();
        }
      });
    },
    function(next) {
      Tweet.knex.schema.hasTable('tweets_ngrams').then(function(exists) {
        if (!exists) {
          Tweet.knex.schema.createTableIfNotExists('tweets_ngrams', function (table) {
            table.integer('tweet').unsigned().notNullable().references('id').inTable('tweets');
            table.integer('ngram').unsigned().notNullable().references('id').inTable('ngrams');
            table.integer('count').unsigned().notNullable()
          }).asCallback(next);
        } else {
          next();
        }
      });
    }
  ],done);
}

module.exports = Tweet;
