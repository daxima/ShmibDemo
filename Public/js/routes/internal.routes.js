
app.config(function($stateProvider, $urlRouterProvider) {

    //$urlRouterProvider.otherwise('/profile');

 
    $stateProvider
    .state('landing', {
        url: '/',
        //template: '<h1>Welcome to your inbox</h1>'
        templateUrl: 'views/tpl.internal/profile.tpl.html'
      })
     
      .state('profile', {
        url: '/profile',
        //template: '<h1>Welcome to your inbox</h1>'
        templateUrl: 'views/tpl.internal/profile.tpl.html'
      })
      .state('profile.edit', {
        url: '/edit',
        //template: '<h1>Welcome to your inbox</h1>'
        templateUrl: 'views/tpl.internal/profile.edit.tpl.html'
      })
      .state('listings', {
        url: '/listings',
        //template: '<h1>Welcome to your inbox</h1>'
        templateUrl: 'views/tpl.internal/listings.tpl.html',
        controller: 'listings'
      })
      .state('sales', {
        url: '/sales',
        //template: '<h1>Welcome to your inbox</h1>'
        templateUrl: 'views/tpl.internal/sales.tpl.html'
      })
    .state('trips', {
        url: '/trips',
        //template: '<h1>Welcome to your inbox</h1>'
        templateUrl: 'views/tpl.internal/trips.tpl.html'
      })
      .state('trips.details', {
        url: '/details',
        //template: '<h1>Welcome to your inbox</h1>'
        templateUrl: 'views/tpl.internal/trip.details.tpl.html'
      });
    
});