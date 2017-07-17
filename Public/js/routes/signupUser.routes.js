app.config(['$routeProvider', '$stateProvider', '$urlRouterProvider', '$locationProvider', function ($routeProvider, $stateProvider, $urlRouterProvider, $locationProvider) {

    //    $locationProvider.html5Mode({
    //      enabled: true,
    //      requireBase: false
    //    });

    $urlRouterProvider.otherwise('');
    $stateProvider
        .state('signupUser', {
            url: "",
            templateUrl: "views/signupUser.client.view.html"

        });
}]);
