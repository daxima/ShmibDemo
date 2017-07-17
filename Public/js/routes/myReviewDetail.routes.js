app.config(['$routeProvider', '$stateProvider', '$urlRouterProvider', '$locationProvider', function ($routeProvider, $stateProvider, $urlRouterProvider, $locationProvider) {   
    $urlRouterProvider.otherwise('');
    $stateProvider
        .state('myReviewDetail', {
            url: "",
            templateUrl: "views/myReviewDetail.client.view.html"
        })       
}]);
