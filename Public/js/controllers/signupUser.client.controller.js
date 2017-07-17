app.controller('onboarding', ['$scope', '$state', '$uibModal', 'UserService', '$cookies', '$rootScope', '$window', function ($scope, $state, $uibModal, UserService, $cookies, $rootScope, $window) {

    $scope.signedUp = false;
    $scope.signupFormValid = false;
    $scope.user = window.user;
    $scope.randomNum = {};
    $scope.emailPattern = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    $scope.passwPattern = /(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z])/;

    var getRandomValues = function (field) {
        $scope.randomNum[field] = Math.random().toString();
    }


    // ==============================
    // Check if email is unique
    // ==============================

    $scope.emailLoading = false;
    $scope.emailAccepted = false;
    $scope.emailFailed = false;
    $scope.duplicateEmail = false;

    $scope.checkEmail = function (emailAddress) {

        getRandomValues('email');
        $scope.emailLoading = true;

        if (emailAddress !== undefined && emailAddress !== null) {

            UserService.emailCheck(emailAddress, true).then(function (response) {
                getRandomValues('email');
                $scope.emailLoading = false;
                if (response.valid) {
                    $scope.emailAccepted = true;
                } else {
                    $scope.duplicateEmail = true;
                }

            });
        } else {
            $scope.emailLoading = false;
            $scope.emailFailed = true;
        }
    }

    $scope.resetEmail = function () {
        $scope.emailLoading = false;
        $scope.emailAccepted = false;
        $scope.emailFailed = false;
        $scope.duplicateEmail = false;
    }

    // ==============================
    // Check if phone number is unique
    // ==============================

    $scope.phoneNumberLoading = false;
    $scope.phoneNumberAccepted = false;
    $scope.phoneNumberFailed = false;
    $scope.phoneNumberDuplicate = false;

    $scope.checkPhoneNumber = function (phoneNumber, PLength) {

        getRandomValues('phoneNumber');
        $scope.phoneNumberLoading = true;
        if (PLength != undefined && PLength != 0) {
            /*UserService.phoneCheck(phoneNumber, true).then(function (response) {
                getRandomValues('phoneNumber');
                $scope.phoneNumberLoading = false;
                if (response.valid) {
                    $scope.phoneNumberAccepted = true;
                } else {
                    $scope.phoneNumberDuplicate = true;
                }

            });*/
        } else if (PLength == 0) {
            $scope.phoneNumberLoading = false;
            $scope.phoneNumberFailed = false;
        } else {
            $scope.phoneNumberLoading = true;
            $scope.phoneNumberFailed = true;
        }

    }

    $scope.resetPhoneNumber = function () {
        $scope.phoneNumberLoading = false;
        $scope.phoneNumberAccepted = false;
        $scope.phoneNumberFailed = false;
        $scope.phoneNumberDuplicate = false;
    }


    // ==============================
    // Signing up new user
    // ==============================
    $scope.signup = {};

    $rootScope.signupUser = null;
    // remove  phoneNumberAccepted according to  SHMB-229 for compare 
    $scope.account = function (signup, isValid) {
        $scope.spinner = true;
        if (signup.phoneNumber == undefined || signup.phoneNumber == '' || phoneNumber == null)
            $scope.phoneNumberAccepted = true;

        if (isValid) {

            if ($scope.emailAccepted) {

                $scope.signedUp = true;

                var phoneNumber = '';
                if(signup.phoneNumber != null)
                    phoneNumber = signup.phoneNumber;
                
                var userObj = {
                    firstName: signup.firstName,
                    lastName: signup.lastName,
                    pwdHash: signup.password,
                    userName: signup.emailAddress,
                    phoneNumber: phoneNumber,
                    contactType: 'REVIEWER'
                }

                UserService.signup(userObj).then(function (result) {
                    $rootScope.userData = result;
                    $rootScope.signupUser = result.contact != null ? result.contact.userName : null;
                    $cookies.put('token', result.token);
                    if (result.status == 'Registration successful!') {
                        // $window.location.href = '/me/review/list';
                        $window.location.href = '/auth/emailverification/checkemail';
                    }
                })
            }
        } else {
            $scope.signupFormValid = true;
            $scope.spinner = false;
        }
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

	    modalInstance.result.then(function () {
	    }, function () {
	    });
    }

}]);
