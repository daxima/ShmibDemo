app.config(['$routeProvider', '$stateProvider', '$urlRouterProvider', function($routeProvider, $stateProvider, $urlRouterProvider){
    
    
    $urlRouterProvider.otherwise('');
     $stateProvider
        .state('reports', {
            url: "",
            templateUrl: "views/reports.client.view.html"
         
        });
    

}]);