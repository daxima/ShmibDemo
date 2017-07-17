app.controller('TermsModalInstanceCtrl', function ($scope, $rootScope ,$uibModalInstance) {
    $scope.ok = function () {             
        $uibModalInstance.close(tcategory);
    };
	
		
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});