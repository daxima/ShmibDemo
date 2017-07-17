app.controller('resetPasswordCtrl', ['$scope', '$state', 'UserService', '$cookies', '$rootScope', '$window', '$uibModal', function ($scope, $state, UserService, $cookies, $rootScope, $window, $uibModal) {


    $scope.user = user;
    $cookies.put('token', token);
    $scope.linkExpired = false;
    $scope.name = "First Name";
    $scope.animationsEnabled = false;
    $scope.passwPattern = /(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z])/;
    $scope.resetPwdvalid = false;
    $scope.resMessage = false;
    $scope.isSuccess = false;
    $scope.resMessageContent = '';
    $scope.hasPwdMatch = true;

    if (err == 'LinkExpired') {
        $scope.linkExpired = true;
    }

    $scope.showTermsPopUp = function () {
        var scope = $scope.$new();

        var tempUrl = '/views/terms.modal.client.view.html';

        var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            scope: scope,
            size: 'lg',
            templateUrl: tempUrl,
            controller: 'TermsModalInstanceCtrl'
        });

        modalInstance.result.then(function () {}, function () {});
    }
    $scope.redirectUser = function () {
        if ($scope.user != null && $scope.user.contactType == 'COMPANY')
            setTimeout(function () {
                $window.location.href = '/auth/login/biz'
            }, 1000);
        else
            setTimeout(function () {
                $window.location.href = '/auth/login';
            }, 1000);
    }

    // ==============================
    // Reset Password
    // ==============================

    $scope.resetpwdnow = function (pwd, cpwd) {

        $scope.resetPwdvalid = true;

        var resetPwdObj = {
            userId: user.id,
            token: token,
            pwd: pwd
        }

        if (pwd != '' && pwd != undefined && cpwd != '' && cpwd != undefined) {
            if (pwd == cpwd) {
                $scope.hasPwdMatch = true;
                UserService.updatepwd(resetPwdObj).then(function (result) {
                    $scope.resMessage = true;
                    if (result.status) {
                        $scope.isSuccess = true;
                        $scope.resMessageContent = result.message;
                        $scope.redirectUser();

                    } else if (result.status) {
                        $scope.isSuccess = false;
                        $scope.resMessageContent = 'An ERROR occurred while resetting password.';
                    }
                });
            } else {
                $scope.hasPwdMatch = false;
            }

        }
    }
}]);
