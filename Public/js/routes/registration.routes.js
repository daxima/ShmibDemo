
app.config(function($stateProvider, $urlRouterProvider) {

    //$urlRouterProvider.otherwise('/basics');

 
    $stateProvider
    .state('index', {
        url: '',
        //template: '<h1>Welcome to your inbox</h1>'
        templateUrl: '/views/tpl/basic.tpl.html',
        controller: 'basic'
      })
      .state('basic', {
        url: '/basics',
        //template: '<h1>Welcome to your inbox</h1>'
        templateUrl: '/views/tpl/basic.tpl.html',
        controller: 'basic'
      })
      .state('description', {
        url: '/description',
        templateUrl: '/views/tpl/description.tpl.html',
        controller: 'description'
      })
     .state('address', {
        url: '/address',
        templateUrl: '/views/tpl/address.tpl.html',
        controller: 'address'
      })
     .state('amenities', {
        url: '/amenities',
        templateUrl: '/views/tpl/amenities.tpl.html',
        controller: 'amenities'
     })
    .state('photos', {
        url: '/photos',
        templateUrl: '/views/tpl/photos.tpl.html',
        controller: 'photos'
     })
    .state('pricing', {
        url: '/pricing',
        templateUrl: '/views/tpl/pricing.tpl.html',
        controller: 'pricing'
     })
    .state('booking', {
        url: '/booking',
        templateUrl: '/views/tpl/booking.tpl.html',
        controller: 'booking'
     })
    .state('calendar', {
        url: '/calendar',
        templateUrl: '/views/tpl/calendar.tpl.html',
        controller: 'calendar'
     });


});