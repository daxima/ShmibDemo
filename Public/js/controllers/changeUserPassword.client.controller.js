app.controller('changepwdCtrl', ['$scope', '$state', 'UserService', '$cookies', '$rootScope', '$window', '$location', function ($scope, $state, UserService, $cookies, $rootScope, $window, $location) {

    $scope.user = user;
    $scope.animationsEnabled = false;
    $scope.passwPattern = /(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z])/;
    $scope.resetPwdvalid = false;
    $scope.resetOldPwdvalid = false;
    $scope.resMessage = false;
    $scope.isSuccess = false;
    $scope.resMessageContent = '';
    var cuser;
    var getRandomValues = function (feild) {
        $scope.randomNum[feild] = Math.random().toString();
    };

    $scope.isReviewer = true;
    var absUrl = $location.absUrl();
    if (absUrl.indexOf('home') !== -1) {
        $scope.isReviewer = false;
    }


    // Only verified user can access this page
    UserService.getUserProfile().then(function (result) {
        if (result.status == 400) {
            if ($scope.isReviewer)
                $window.location.href = '/auth/login';
            else
                $window.location.href = '/auth/login/biz';
        } else {
            cuser = result;
        }
    });

    // ==============================
    // Reset Password
    // ==============================

    $scope.resetpwdnowmodal = function (opwd, pwd, isValid) {
        $scope.spinner = true;
        $scope.resetPwdvalid = true;
        $scope.resetOldPwdvalid = false;

        if (opwd != undefined && opwd != '' && pwd != '' && pwd != undefined && isValid) {

            var resetPwdObj = {
                uid: $scope.user.id,
                pwd: pwd,
                oldpwd: opwd,
                token: cuser.token
            }

            UserService.changUserPassword(resetPwdObj).then(function (result) {
                $scope.resMessage = true;
                if (result.success) {
                    $scope.isSuccess = true;
                    $scope.resMessageContent = result.message;
                    if ($scope.isReviewer) {
                        setTimeout(function () {
                            $window.location.href = "/auth/logout";
                        }, 1000)
                    } else {
                        setTimeout(function () {
                            $window.location.href = "/auth/logout/biz";
                        }, 1000)
                    }
                } else {
                    $scope.spinner = false;
                    $scope.isSuccess = false;
                    $scope.resMessageContent = result.data.message;
                }
            });
        } else {
            $scope.resetOldPwdvalid = true;
            $scope.spinner = false;
        }

    };

    $scope.back = function () {
        if ($scope.isReviewer) {
            $window.location.href = "/me/profile";
        } else {
            $window.location.href = "/home/profile";
        }
    };

}]);
