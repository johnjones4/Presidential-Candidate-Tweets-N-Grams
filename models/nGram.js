'use strict';

var Model = require('./model');
var commonWords = require('../commonWords');

class NGram extends Model {
  constructor() {
    super();
    this.nGram = null;
    this.count = 0;
  }

  save(done) {
    var data = {
      'ngram': this.nGram
    };
    this._save(NGram.knex('ngrams'),data,done);
  }
}

NGram.loadAll = function(done) {
  NGram.knex
    .select('id','ngram','updated_at','created_at',NGram.knex.raw('(select sum(count) from tweets_ngrams tn where tn.ngram = id) as count'))
    .from('ngrams')
    .whereNotIn('ngram',commonWords)
    .orderBy('count','desc')
    .orderBy('ngram','asc')
    .asCallback(function(err,rows) {
      if (err) {
        done(err);
      } else {
        done(null,NGram.generateObjects(rows));
      }
    });
}

NGram.findByNGram = function(nGram,done) {
  NGram.knex
    .select('id','ngram','updated_at','created_at',NGram.knex.raw('(select sum(count) from tweets_ngrams tn where tn.ngram = id) as count'))
    .from('ngrams')
    .where({
      'ngram': nGram
    })
    .asCallback(function(err,rows) {
      if (err) {
        done(err);
      } else if (rows.length > 0) {
        done(null,NGram.generateObjects(rows)[0]);
      } else {
        var nGramObject = new NGram();
        nGramObject.nGram = nGram;
        nGramObject.save(done);
      }
    });
}

NGram.generateObjects = function(rows) {
  return rows.map(function(row) {
    var ngram = new NGram();
    ngram.id = row.id;
    ngram.nGram = row.ngram;
    ngram.created = row.created_at;
    ngram.updated = row.updated_at;
    ngram.count = row.count;
    return ngram;
  })
}

NGram.generateTable = function(done) {
  NGram.knex.schema.hasTable('ngrams').then(function(exists) {
    if (!exists) {
      NGram.knex.schema.createTableIfNotExists('ngrams', function (table) {
        table.increments('id').primary();
        table.string('ngram').notNullable().unique();
        table.timestamps();
        table.index(['ngram']);
      }).asCallback(done);
    } else {
      done();
    }
  });
}

module.exports = NGram;
