app.config(['$routeProvider', '$stateProvider', '$urlRouterProvider', '$locationProvider', function ($routeProvider, $stateProvider, $urlRouterProvider, $locationProvider) {

    //    $locationProvider.html5Mode({
    //      enabled: true,
    //      requireBase: false
    //    });

    $urlRouterProvider.otherwise('');
    $stateProvider
        .state('signup', {
            url: "",
            templateUrl: "views/signup.client.view.html"

        }).state('signup.businessregistration', {
            url: "/branch",
            params: {
                updater: 1,
            },
            templateUrl: "views/businessRegistration.client.view.html",
            controller: 'businessRegistrationCtrl'
        });
}]);
