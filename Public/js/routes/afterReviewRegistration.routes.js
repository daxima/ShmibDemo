app.config(['$routeProvider', '$stateProvider', '$urlRouterProvider', function ($routeProvider, $stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('');
    $stateProvider
        .state('userRegistration', {
            url: "",
            views: {
                "registrationview@": {
                    templateUrl: "/views/afterReviewRegistration.client.view.html"
                }
            },

            controller: 'userRegistrationCtrl'
        })
        .state('userRegistration.thanks', {
            url: '/thanks',
            views: {
                "registrationview@": {
                    templateUrl: '/views/userRegistrationComplete.client.view.html'
                }
            }

        })
}]);
