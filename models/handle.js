'use strict';

var Model = require('./model');

class Handle extends Model {
  constructor() {
    super();
    this.name = null;
    this.handle = null;
    this.lastTweet = null;
  }

  save(done) {
    var data = {
      'name': this.name,
      'handle': this.handle,
      'lastTweet': this.lastTweet
    };
    this._save(Handle.knex('handles'),data,done);
  }

  loadNGrams(ngramIds,done) {
    var _this = this;

    var query = Handle.knex
      .select(['ngrams.ngram'])
      .sum('tweets_ngrams.count as count')
      .from('tweets_ngrams')
      .innerJoin('ngrams','tweets_ngrams.ngram','ngrams.id')
      .whereIn('tweet',function() {
        this
          .select('id')
          .from('tweets')
          .where({
            'tweets.handle': _this.id
          });
      })
      .groupBy('tweets_ngrams.ngram')
      .orderBy('count','desc')
      .orderBy('ngram','asc');

    if (ngramIds && ngramIds.length > 0) {
      query.whereIn('tweets_ngrams.ngram',ngramIds)
    }

    query.asCallback(function(err,rows) {
      if (err) {
        done(err);
      } else {
        _this.ngrams = rows.map(function(row) {
          return {
            'nGram': row.ngram,
            'count': row.count
          }
        });
        done(null,_this);
      }
    });
  }
}

Handle._loadCallback = function(done) {
  return function(err,rows) {
    if (err) {
      done(err);
    } else if (rows.length > 0) {
      done(null,Handle.generateObjects(rows)[0]);
    } else {
      done(null,null);
    }
  }
}

Handle.loadAll = function(done) {
  Handle.knex
    .select('id','name','handle','lastTweet','created_at','updated_at')
    .from('handles')
    .asCallback(function(err,rows) {
      if (err) {
        done(err);
      } else {
        done(null,Handle.generateObjects(rows));
      }
    });
};

Handle.findByHandle = function(handle,done) {
  Handle.knex
    .select('id','name','handle','lastTweet','created_at','updated_at')
    .from('handles')
    .where({
      'handle': handle
    })
    .asCallback(Handle._loadCallback(done));
};

Handle.load = function(id,done) {
  Handle.knex
    .select('id','name','handle','lastTweet','created_at','updated_at')
    .from('handles')
    .where({
      'id': id
    })
    .asCallback(Handle._loadCallback(done));
};

Handle.findOrCreateHandle = function(_handle,name,done) {
  Handle.findByHandle(_handle,function(err,handle) {
    if (err || handle) {
      done(err,handle);
    } else {
      handle = new Handle();
      handle.name = name;
      handle.handle = _handle;
      handle.save(done);
    }
  })
};

Handle.generateObjects = function(rows) {
  return rows.map(function(row) {
    var handle = new Handle();
    handle.id = row.id;
    handle.name = row.name;
    handle.handle = row.handle;
    handle.lastTweet = row.lastTweet;
    handle.created = row.created_at;
    handle.updated = row.updated_at;
    return handle;
  })
}

Handle.generateTable = function(done) {
  Handle.knex.schema.hasTable('handles').then(function(exists) {
    if (!exists) {
      Handle.knex.schema.createTableIfNotExists('handles', function (table) {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('handle').notNullable().unique();
        table.string('lastTweet');
        table.timestamps();
        table.index(['handle']);
      }).asCallback(done);
    } else {
      done();
    }
  });
}

module.exports = Handle;
