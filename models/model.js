'use strict';

class Model {
  constructor() {
    this.id = null;
    this.created = new Date();
    this.updated = new Date();
  }

  _save(table,data,done) {
    data.created_at = this.created;
    this.updated = data.updated_at = new Date();
    var _this = this;
    if (this.id) {
      table
        .where({
          'id': this.id
        })
        .update(data)
        .asCallback(function(err) {
          done(err,_this);
        });
    } else {
      table
        .insert(data)
        .asCallback(function(err,inserts) {
          if (err) {
            done(err,_this);
          } else if (inserts.length > 0) {
            _this.id = inserts[0];
            done(null,_this);
          } else {
            done(null,_this);
          }
        });
    }
  }
}

module.exports = Model;
