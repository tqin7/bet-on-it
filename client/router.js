
Router.configure({
  // the default layout
  layoutTemplate: 'mainNav'
});

Router.route('/', function () {
  this.render('homePage');
  this.layout('mainNav');
});


Router.route('/pool', function () {
  this.render('poolPage');
  this.layout('mainNav');
});

Router.route('/profile', function () {
  this.render('profilePage');
  this.layout('mainNav');
});
