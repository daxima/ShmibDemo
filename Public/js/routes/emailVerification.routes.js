app.config(['$routeProvider', '$stateProvider', '$urlRouterProvider', '$locationProvider', function ($routeProvider, $stateProvider, $urlRouterProvider, $locationProvider) {

    $urlRouterProvider.otherwise('');
    $stateProvider
        .state('emailVerification', {
            url: "",
            templateUrl: "views/emailVerification.client.view.html"

        });
}]);
