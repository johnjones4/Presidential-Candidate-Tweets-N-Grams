['issue','member','tweet'].map(function(inc) {
  module.exports[inc] = require('./' + inc);
});
