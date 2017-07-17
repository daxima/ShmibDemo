app.config(['$routeProvider', '$stateProvider', '$urlRouterProvider', '$locationProvider', function ($routeProvider, $stateProvider, $urlRouterProvider, $locationProvider) {   
    $urlRouterProvider.otherwise('');
    $stateProvider
        .state('myReview', {
            url: "",
            templateUrl: "views/myReview.client.view.html"

        })       
}]);
