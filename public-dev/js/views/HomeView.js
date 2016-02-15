HomeView = Backbone.View.extend({
  'attributes': {
    'class': 'container'
  },
  initialize: function(){
    this.issues = new IssuesCollection();
    this.members = new MembersCollection();
    var _this = this;
    this.issues.fetch({
      'success': function() {
        _this.members.fetch({
          'success': function() {
            _this.render();
          }
        });
      }
    });
  },
  render: function() {
    var template = _.template($("#home-template").html());
    var params = {
      'issues': this.issues.map(function(issue) {
        return issue.toJSON();
      }),
      'members': this.members.map(function(member) {
        return member.toJSON();
      })
    };
    var html = template(params);
    this.$el.html($(html));
  }
});
