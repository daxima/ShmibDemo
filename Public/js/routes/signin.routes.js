

app.config(['$routeProvider', '$stateProvider', '$urlRouterProvider', function($routeProvider, $stateProvider, $urlRouterProvider){
    
    
    $urlRouterProvider.otherwise('');
     $stateProvider
        .state('index', {
          url: "",
         templateUrl: "views/signin.client.view.html"
         
        });
    

}]);



