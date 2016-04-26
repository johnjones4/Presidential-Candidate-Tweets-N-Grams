'use strict';

var Model = require('./model');

class Member extends Model {
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
    this._save(Member.knex('members'),data,done);
  }
}

Member.findByHandle = function(handle,done) {
  Member.knex
    .select('id','name','handle','lastTweet','created_at','updated_at')
    .from('members')
    .where({
      'handle': handle
    })
    .asCallback(function(err,rows) {
      if (err) {
        done(err);
      } else if (rows.length > 0) {
        done(null,Member.generateObjects(rows)[0]);
      } else {
        done(null,null);
      }
    })
};

Member.findOrCreateMember = function(handle,name,done) {
  Member.findByHandle(handle,function(err,member) {
    if (err || member) {
      done(err,member);
    } else {
      member = new Member();
      member.name = name;
      member.handle = handle;
      member.save(done);
    }
  })
};

Member.generateObjects = function(rows) {
  return rows.map(function(row) {
    var member = new Member();
    member.id = row.id;
    member.name = row.name;
    member.handle = row.handle;
    member.lastTweet = row.lastTweet;
    member.created = row.created_at;
    member.updated = row.updated_at;
    return member;
  })
}

Member.generateTable = function(done) {
  Member.knex.schema.hasTable('members').then(function(exists) {
    if (!exists) {
      Member.knex.schema.createTableIfNotExists('members', function (table) {
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

module.exports = Member;
