app.config(['$routeProvider', '$stateProvider', '$urlRouterProvider', function($routeProvider, $stateProvider, $urlRouterProvider){
    
    
    $urlRouterProvider.otherwise('');
     $stateProvider
        .state('myprofile', {
            url: "",
            templateUrl: "views/myprofile.client.view.html"
         
        });
    

}]);