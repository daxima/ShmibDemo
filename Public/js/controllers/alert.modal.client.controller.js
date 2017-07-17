app.controller('AlertModalInstanceCtrl', ['$scope', '$uibModalInstance', '$window', function ($scope, $uibModalInstance, $window) {

    $scope.title = $scope.params.title;
    $scope.message = $scope.params.message;
    $scope.navigationURL = $scope.params.navigationURL;

    //cancel button will appear or not
    $scope.showCancel = false;
    if ($scope.navigationURL && $scope.navigationURL != '') {
        $scope.showCancel = true;
    }

    $scope.ok = function () {
        if ($scope.navigationURL && $scope.navigationURL != '')
            $window.location.href = $scope.navigationURL;
        else
            $scope.cancel();
    };


    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}]);
