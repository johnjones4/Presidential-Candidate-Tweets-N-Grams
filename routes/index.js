module.exports = {};

['api'].forEach(function(inc) {
  module.exports[inc] = require('./' + inc);
})