(function($) {
  var $main = $('#main');

  var AppRouter = Backbone.Router.extend({
    initialize: function() {
      this.bind('route', this._pageView);
    },
    _pageView: function() {
      var path = Backbone.history.getFragment();
      // ga('send', 'pageview', {page: "/" + path});
    },
    routes: {
      'member/:id': 'memberRoute',
      'issue/:id': 'issueRoute',
      '*actions': 'defaultRoute'
    }
  });

  var router = new AppRouter();

  router.on('route:defaultRoute', function(actions) {
    $main.html(new HomeView().$el);
  });

  router.on('route:memberRoute', function(id) {
    var member = new MemberModel({'_id': id});
    member.fetch({
      'success': function() {
        $main.html(new MemberView({'model': member}).$el);
      }
    });
  });

  router.on('route:issueRoute', function(id) {
    var issue = new IssueModel({'_id': id});
    issue.fetch({
      'success': function() {
        $main.html(new IssueView({'model': issue}).$el);
      }
    });
  });

  Backbone.history.start();
})(jQuery);
