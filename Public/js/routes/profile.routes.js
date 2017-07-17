app.config(['$routeProvider', '$stateProvider', '$urlRouterProvider', function($routeProvider, $stateProvider, $urlRouterProvider){
    
    
    $urlRouterProvider.otherwise('');
     $stateProvider
        .state('profile', {
            url: "",
            templateUrl: "views/profile.client.view.html"
         
        });
    

}]);