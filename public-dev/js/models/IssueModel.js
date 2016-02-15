IssueModel = Backbone.Model.extend({
  'idAttribute': '_id',
  'url': function() {
    return '/api/issue/' + this.get('_id') + '?' +
      [
        ['start',1451606400000],
        ['resolution','day'],
        ['end',new Date().getTime()]
      ]
      .map(function(param) {
        return param[0] + '=' + encodeURIComponent(param[1]);
      })
      .join('&');
  }
});
