app.controller('FPModalInstanceCtrl', function ($scope, $uibModalInstance, $http, UserService) {

    $scope.formShow = true;
    $scope.msgShow = false;
    $scope.submitted = false;
    $scope.randomNum = {};
    $scope.emailPattern = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;

    var getRandomValues = function (field) {
        $scope.randomNum[field] = Math.random().toString();
    }

    $scope.resetEmail = function () {
        getRandomValues('email');
        $scope.submitted = false;
    }

    $scope.reset = function () {
        $scope.submitted = true;
        $scope.newEmail = false;
        var emailAddress = $scope.resetpw.emailAddress;

        if (emailAddress != '') {
            var data = {
                EmailAddress: $scope.resetpw.emailAddress
            };
            UserService.forgotpwd(data).then(function (result) {
                if (result.status == 400) {
                    $scope.newEmail = true;
                    $scope.formShow = true;
                    $scope.msgShow = false;
                    $scope.errMessage = result.data.message;
                } else if (result.status == 200) {
                    $scope.formShow = false;
                    $scope.msgShow = true;
                }

            });
        }
    };

    $scope.ok = function () {
        $uibModalInstance.close();
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});
