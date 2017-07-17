app.config(['$routeProvider', '$stateProvider', '$urlRouterProvider', '$locationProvider', function ($routeProvider, $stateProvider, $urlRouterProvider, $locationProvider) {
    /*
    $locationProvider.html5Mode({
      enabled: true,
      requireBase: false
    });
    */
    $urlRouterProvider.otherwise('');
    $stateProvider
        .state('reviews', {
            url: "",
            templateUrl: "views/reviews.client.view.html"

        })
        .state('reviews.details', {
            url: "/item/:id",
            templateUrl: "views/reviewDetails.client.view.html",
            controller: "reviewDetailsCtrl"
        });


}]);
