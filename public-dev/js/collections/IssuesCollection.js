IssuesCollection = Backbone.Collection.extend({
  'model': IssueModel,
  'url': function() {
    return '/api/issue?' +
      [
        ['start',1451606400000],
        ['end',new Date().getTime()]
      ]
      .map(function(param) {
        return param[0] + '=' + encodeURIComponent(param[1]);
      })
      .join('&');
  }
});
