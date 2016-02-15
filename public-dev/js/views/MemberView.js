MemberView = Backbone.View.extend({
  'attributes': {
    'class': 'container'
  },
  initialize: function(){
    this.render();
  },
  render: function() {
    var template = _.template($("#member-template").html());
    var params = {
      'member': this.model.toJSON()
    };
    var html = template(params);
    this.$el.html($(html));
  }
});
