IssueView = Backbone.View.extend({
  'attributes': {
    'class': 'container'
  },
  initialize: function(){
    this.render();
  },
  render: function() {
    var template = _.template($("#issue-template").html());
    var tallies = this.model.get('tallies');
    tallies.reverse();
    var params = {
      'issue': this.model.toJSON(),
      'tallies': tallies.map(function(tally) {
        return {
          'dateString': new Date(tally.date),
          'count': tally.count
        };
      })
    };
    var html = template(params);
    this.$el.html($(html));
  }
});
