app.config(['$routeProvider', '$stateProvider', '$urlRouterProvider', function($routeProvider, $stateProvider, $urlRouterProvider){
    $urlRouterProvider.otherwise('');
     $stateProvider
        .state('changeUserPassword', {
            url: "",
            templateUrl: "views/changeUserPassword.client.view.html"        
        });    
}]);