app.controller('MyreviewsCtrl', ['$scope', '$state', 'UserService', '$rootScope', '$window', 'lodash', function ($scope, $state, UserService, $rootScope, $window, lodash) {


    // Only verified user can access this page
    UserService.getUserProfile().then(function (result) {
        if (result.status == 400) {
            $window.location.href = '/auth/login';
        }
    });

    $scope.userReview = [] //reviews;
    $rootScope.host = $window.location.host;
    $rootScope.uid = user.id;
    $scope.Name = '';
    $scope.Reviews = [];
    $scope.pushRank = {};
    $scope.isDayShow = false;
    $scope.noReviews = false;
    var today = new Date();
    if (user.firstName != null || user.firstName != undefined)
        $scope.Name = user.firstName + ' ' + user.lastName;
    else
        $scope.Name = user.userName;

    $scope.isBizContact = false;
    if (user.contactType.toUpperCase() == 'COMPANY')
        $scope.isBizContact = true;

    var userID = user.id;
    var id = null;
    var reviews = [];
    UserService.getReviews(userID, id, null, null).then(function (result) {
        if (result.reviews.length > 0) {
            $scope.noReviews = false;

            for (var i = 0; i < result.reviews.length; i++) {
                $scope.pushRank = {};
                var reviewObj = {
                    id: null,
                    companyId: null,
                    companyName: null,
                    review: [],
                    timeElapsed: null,
                    isDay: false
                };

                reviewObj.id = result.reviews[i].id;
                reviewObj.companyId = result.reviews[i].companyId;
                reviewObj.companyName = result.reviews[i].name;
                result.reviews[i].scoreFood = result.reviews[i].scoreFood == null ? 0 : result.reviews[i].scoreFood;
                result.reviews[i].scoreService = result.reviews[i].scoreService == null ? 0 : result.reviews[i].scoreService;
                result.reviews[i].scoreClean = result.reviews[i].scoreClean == null ? 0 : result.reviews[i].scoreClean;
                var avgReview = parseFloat((parseInt(result.reviews[i].scoreFood) + parseInt(result.reviews[i].scoreService) + parseInt(result.reviews[i].scoreClean)) / 3);
                getStar(avgReview);
                reviewObj.review = $scope.pushRank;
                reviewObj.timeElapsed = daysBetween(new Date(result.reviews[i].createdAt), today);
                if ($scope.isDayShow)
                    reviewObj.isDay = true;

                $scope.Reviews.push(reviewObj);

            }
        } else {
            $scope.noReviews = true;
        }

    });

    $scope.getItemDetail = function (obj) {
        $window.location.href = '/me/review/item/' + obj.id;
    };

    function getStar(number) {
        var totalnumber = Math.round(number);
        $scope.pushRank = {};
        switch (totalnumber) {
            case 1:
                $scope.pushRank = [{
                        id: 1,
                        star: 'glyphicon glyphicon-star'
                    },
                    {
                        id: 2,
                        star: 'glyphicon glyphicon-star opacity_half'
                    },
                    {
                        id: 3,
                        star: 'glyphicon glyphicon-star opacity_half'
                    },
                    {
                        id: 4,
                        star: 'glyphicon glyphicon-star opacity_half'
                    },
                    {
                        id: 5,
                        star: 'glyphicon glyphicon-star opacity_half'
                    }];
                break;
            case 2:
                $scope.pushRank = [{
                        id: 1,
                        star: 'glyphicon glyphicon-star'
                    },
                    {
                        id: 2,
                        star: 'glyphicon glyphicon-star'
                    },
                    {
                        id: 3,
                        star: 'glyphicon glyphicon-star opacity_half'
                    },
                    {
                        id: 4,
                        star: 'glyphicon glyphicon-star opacity_half'
                    },
                    {
                        id: 5,
                        star: 'glyphicon glyphicon-star opacity_half'
                    }];
                break;
            case 3:
                $scope.pushRank = [{
                        id: 1,
                        star: 'glyphicon glyphicon-star'
                    },
                    {
                        id: 2,
                        star: 'glyphicon glyphicon-star'
                    },
                    {
                        id: 3,
                        star: 'glyphicon glyphicon-star'
                    },
                    {
                        id: 4,
                        star: 'glyphicon glyphicon-star opacity_half'
                    },
                    {
                        id: 5,
                        star: 'glyphicon glyphicon-star opacity_half'
                    }];
                break;
            case 4:
                $scope.pushRank = [{
                        id: 1,
                        star: 'glyphicon glyphicon-star'
                    },
                    {
                        id: 2,
                        star: 'glyphicon glyphicon-star'
                    },
                    {
                        id: 3,
                        star: 'glyphicon glyphicon-star'
                    },
                    {
                        id: 4,
                        star: 'glyphicon glyphicon-star'
                    },
                    {
                        id: 5,
                        star: 'glyphicon glyphicon-star opacity_half'
                    }];
                break;
            case 5:
                $scope.pushRank = [{
                        id: 1,
                        star: 'glyphicon glyphicon-star'
                    },
                    {
                        id: 2,
                        star: 'glyphicon glyphicon-star'
                    },
                    {
                        id: 3,
                        star: 'glyphicon glyphicon-star'
                    },
                    {
                        id: 4,
                        star: 'glyphicon glyphicon-star'
                    },
                    {
                        id: 5,
                        star: 'glyphicon glyphicon-star'
                    }];
                break;
            default:
                $scope.pushRank = [{
                        id: 1,
                        star: 'glyphicon glyphicon-star opacity_half'
                    },
                    {
                        id: 2,
                        star: 'glyphicon glyphicon-star opacity_half'
                    },
                    {
                        id: 3,
                        star: 'glyphicon glyphicon-star opacity_half'
                    },
                    {
                        id: 4,
                        star: 'glyphicon glyphicon-star opacity_half'
                    },
                    {
                        id: 5,
                        star: 'glyphicon glyphicon-star opacity_half'
                    }];
                break;
        }
    }

    function daysBetween(date1, date2) {
        var one_day = 1000 * 60 * 60 * 24;
        var date1_ms = date1.getTime();
        var date2_ms = date2.getTime();
        var difference_ms = date2_ms - date1_ms;
        difference_ms = difference_ms / 1000;
        var seconds = Math.floor(difference_ms % 60);
        difference_ms = difference_ms / 60;
        var minutes = Math.floor(difference_ms % 60);
        difference_ms = difference_ms / 60;
        var hours = Math.floor(difference_ms % 24);
        var days = Math.floor(difference_ms / 24);
        $scope.isDayShow = true;
        return date1;

    }
    $scope.getMyProfile = function () {
        $window.location.href = '/me/profile';
    }
    $scope.getBizSearchPage = function () {
        $window.location.href = '/me/biz/search';
    }

    $scope.getReviewPage = function () {
        $window.location.href = '/me/review/list';
    }
}]);
