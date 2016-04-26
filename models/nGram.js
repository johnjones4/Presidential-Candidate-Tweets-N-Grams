'use strict';

var Model = require('./model');

class NGram extends Model {
  constructor() {
    super();
    this.nGram = null;
  }

  save(done) {
    var data = {
      'nGram': this.nGram
    };
    this._save(NGram.knex('ngrams'),data,done);
  }
}

NGram.findByNGram = function(nGram,done) {
  NGram.knex
    .select('id','nGram','updated_at','created_at')
    .from('ngrams')
    .where({
      'nGram': nGram
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
    ngram.nGram = row.nGram;
    ngram.created = row.created_at;
    ngram.updated = row.updated_at;
    return ngram;
  })
}

NGram.generateTable = function(done) {
  NGram.knex.schema.hasTable('ngrams').then(function(exists) {
    if (!exists) {
      NGram.knex.schema.createTableIfNotExists('ngrams', function (table) {
        table.increments('id').primary();
        table.string('nGram').notNullable().unique();
        table.timestamps();
        table.index(['nGram']);
      }).asCallback(done);
    } else {
      done();
    }
  });
}

module.exports = NGram;
