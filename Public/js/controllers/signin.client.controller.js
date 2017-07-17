app.controller('signin', function ($scope, $uibModal, UserService, $window, $cookies) {

    $scope.emailPattern = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;

    if (flashMessage != 'Success') {
        $scope.resMessage = true;
        $scope.errormessage = flashMessage; //show email verification message
    } else {
        $scope.resMessage = false;
    }

    $scope.name = "First Name";
    $scope.user = window.user;
    $scope.animationsEnabled = false;
    $scope.signinBizFormValid = false;
    $scope.LoginUser = {
        userName: null,
        pwdHash: null
    }

    $scope.send = function (userName, pwd, isValid) {
        $scope.spinner = true;
        $scope.signinBizFormValid = true;
        $scope.errormessage == '';
        if (isValid) {
            var user = {
                userName: userName,
                pwdHash: pwd
            }
            UserService.signinBiz(user).then(function (result) {
                $scope.resMessage = true;
                if (result.success) {
                    $cookies.put('token', result.token);
                    $window.location.href = '/home/review/list';
                } else {
                    $scope.errormessage = result.message;
                    $scope.spinner = false;
                }

            });
        } else {
            $scope.spinner = false;
        }
    }

    $scope.ClrMsg = function () {
        $scope.resMessage = false;
        $scope.errormessage = '';
        $scope.spinner = false;
    }

    $scope.openPopUp = function () {

        var scope = $scope.$new();

        var tempUrl = "";
        tempUrl = 'views/forgotPassword.client.view.html';

        var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            scope: scope,
            size: 'sm',
            templateUrl: tempUrl,
            controller: 'FPModalInstanceCtrl',
        });

        modalInstance.result.then(function () {}, function () {});

    };

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

})
