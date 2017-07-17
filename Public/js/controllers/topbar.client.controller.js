app.controller('topbarCtrl', ['$scope', '$state', '$rootScope', '$location', '$uibModal', '$window', '$http', 'UserService', function ($scope, $state, $rootScope, $location, $uibModal, $window, $http, UserService) {

    $scope.showLoader = true;
    $rootScope.currentURL = $location.$$absUrl;

    var url = $rootScope.currentURL;
    url = url.replace(window.location.hash, '');

    var urlSegments = url.split('/');
    var lastSegment = urlSegments[urlSegments.length - 1];

    if (lastSegment == '') {
        lastSegment = urlSegments[urlSegments.length - 2];
    }

    UserService.getUserBusinesses().then(function (result) {
        if (result) {
            var hasBizId = false;
            $scope.companies = result;

            for (var index = 0; $scope.companies.length > index; index++) {
                if ($scope.companies[index].id == lastSegment) {
                    $rootScope.CompanyId = $scope.companies[index].id;
                    $scope.restaurantName = $scope.companies[index].name;

                    $rootScope.selectedBizId = $rootScope.CompanyId;
                    $rootScope.selectedBizName = $scope.restaurantName;
                    hasBizId = true;
                    break;
                }
            }

            if (!hasBizId) {
                $rootScope.CompanyId = $scope.companies[0].id;
                $scope.restaurantName = $scope.companies[0].name;

                $rootScope.selectedBizId = $rootScope.CompanyId;
                $rootScope.selectedBizName = $scope.restaurantName;
            }
        }
        $scope.showLoader = false;
    });

    $scope.animationsEnabled = false;

    $scope.goToMyReviews = function () {
        var scope = $scope.$new();

        var tempUrl = '/views/alert.client.view.html';

        scope.params = {
            title: 'Navigate to My Shmibber Account',
            message: 'You are leaving the business configuration area. You will now see the shmibs that you give to others.',
            navigationURL: '/me/review/list'
        };
        var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            scope: scope,
            size: 'md',
            templateUrl: tempUrl,
            controller: 'AlertModalInstanceCtrl'
        });

        modalInstance.result.then(function () {}, function () {});
    };

    $scope.setCompany = function (company) {
        $rootScope.selectedBizId = company.id;
        $rootScope.selectedBizName = company.name;
        $rootScope.CompanyId = company.id;
        $scope.restaurantName = company.name;
        var navigationUrl = '';
        var hasBizId = false;

        for (var index = 0; $scope.companies.length > index; index++) {
            if ($scope.companies[index].id == lastSegment) {
                var lastIndex = url.lastIndexOf('/');
                navigationUrl = url.substr(0, lastIndex);
                hasBizId = true;
                break;
            }
        }
        if (!hasBizId) {
            navigationUrl = url;
        }
        if (navigationUrl.slice(-1) == '/') {
            navigationUrl = navigationUrl.substring(0, navigationUrl.length - 1);
        }

        $window.location.href = navigationUrl + '/' + $rootScope.selectedBizId;
    }
}]);
