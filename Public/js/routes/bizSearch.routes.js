app.config(['$routeProvider', '$stateProvider', '$urlRouterProvider', '$locationProvider', function ($routeProvider, $stateProvider, $urlRouterProvider, $locationProvider) {

    //    $locationProvider.html5Mode({
    //      enabled: true,
    //      requireBase: false
    //    });

    $urlRouterProvider.otherwise('');
    $stateProvider
        .state('bizSearch', {
            url: "",
            templateUrl: "views/bizSearch.client.view.html"

        });
}]);
