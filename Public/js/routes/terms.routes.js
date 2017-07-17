app.config(['$routeProvider', '$stateProvider', '$urlRouterProvider', function($routeProvider, $stateProvider, $urlRouterProvider){
    
    
    $urlRouterProvider.otherwise('');
     $stateProvider
        .state('terms', {
            url: "",
            templateUrl: "views/terms.client.view.html"
         });
    

}]);