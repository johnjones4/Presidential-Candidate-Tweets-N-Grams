MembersCollection = Backbone.Collection.extend({
  'model': IssueModel,
  'url': 'api/member'
});
