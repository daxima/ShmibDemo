app.config(['$routeProvider', '$stateProvider', '$urlRouterProvider', '$locationProvider', function ($routeProvider, $stateProvider, $urlRouterProvider, $locationProvider) {

    $urlRouterProvider.otherwise('');
    $stateProvider
        .state('userReview', {
            url: "",
            views: {
                "projectlistview@": {
                    templateUrl: "/views/userReview.client.view.html"
                }
            },

            controller: 'userReview'
        })
        .state('userReview.food', {
            url: '/reviewfood',
            views: {
                "projectlistview@": {
                    templateUrl: '/views/reviewFood.client.view.html'
                }
            }

        })
        .state('userReview.service', {
            url: '/reviewservice',
            views: {
                "projectlistview@": {
                    templateUrl: '/views/reviewService.client.view.html'
                }
            }
        })
        .state('userReview.clean', {
            url: '/reviewclean',
            views: {
                "projectlistview@": {
                    templateUrl: '/views/reviewClean.client.view.html'
                }
            }
        })
        .state('userReview.comment', {
            url: '/reviewprofile',
            views: {
                "projectlistview@": {
                    templateUrl: '/views/reviewComment.client.view.html'
                }
            }
        })
        .state('userReview.complete', {
            url: '/complete',
            views: {
                "projectlistview@": {
                    templateUrl: '/views/userRegistrationComplete.client.view.html'
                }
            }
        })
}]);
