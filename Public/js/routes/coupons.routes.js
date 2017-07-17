app.config(['$routeProvider', '$stateProvider', '$urlRouterProvider', function($routeProvider, $stateProvider, $urlRouterProvider){
    
    
    $urlRouterProvider.otherwise('');
     $stateProvider
        .state('coupons', {
            url: "",
            templateUrl: "views/coupons.client.view.html"
         
         })
        .state('coupons.details', {
            url: "/coupon/:id",
            templateUrl: "views/couponDetails.client.view.html",
            controller: "couponDetailsCtrl"
        })
         .state('coupons.add', {
            url: "",
            templateUrl: "views/couponAdd.client.view.html",
            controller: "couponDetailsCtrl"
        });
    

}]);