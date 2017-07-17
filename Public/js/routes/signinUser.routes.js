

app.config(['$routeProvider', '$stateProvider', '$urlRouterProvider', function($routeProvider, $stateProvider, $urlRouterProvider){
    
    
    $urlRouterProvider.otherwise('');
     $stateProvider
        .state('signinUser', {
          url: "",
         templateUrl: "views/signinUser.client.view.html"
         
        });
    

}]);



