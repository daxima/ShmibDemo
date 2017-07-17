app.controller('emailVerification', ['$scope', '$state', '$uibModal', 'UserService', '$cookies', '$rootScope', '$window', function ($scope, $state, $uibModal, UserService, $cookies, $rootScope, $window) {

    $scope.status = '';
    $scope.statusb = 1;
    $scope.contacttype = '';
    
    $scope.init = function () {
        if (tuid == 'checkemail') { //email verification message to be shown
            $scope.statusb = 3;
            $scope.status = "Please check your email to verify your email address and follow the instructions in the email.";
        } else {
            $scope.status = "In Progress to verify this Email.";
            UserService.emailverification(tuid).then(function (result) {
                if (result.status == 'success') {
                    $scope.statusb = 2;
                    $scope.status = "Email verified successfully, Please click on the link below to continue:";
                    $scope.contacttype = result.contacttype;
                } else if (result.status == 'alreadyverified') {
                    $scope.statusb = 2;
                    $scope.status = "Email has already been verified, Please click on the link below to continue:";
                    $scope.contacttype = result.contacttype;
                } else if (result.status == 'nocontact') {
                    $scope.statusb = 3;
                    $scope.status = "Email cannot be identified.";
                } else {
                    $scope.status = "Cannot verify this email.";
                    $scope.statusb = 3;
                }
            });
        }
    }

    $scope.init();

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

	    modalInstance.result.then(function () {
	    }, function () {
	    });
    };
    
        
    $scope.gotoLogin = function(){
        if($scope.contacttype == 'COMPANY')
            $window.location.href='/auth/login/biz';
        else if($scope.contacttype == 'REVIEWER')
            $window.location.href='/me/review/list';
    }

}]);
