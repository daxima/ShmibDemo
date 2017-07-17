app.controller('userRegistrationCtrl', ['$scope', '$window', '$state', '$uibModal', '$rootScope', 'UserService', '$timeout', '$cookies', function ($scope, $window, $state, $uibModal, $rootScope, UserService, $timeout, $cookies) {

    $scope.version = version;
    $scope.isRegisteredUser = false;
    $scope.isFocused = true;
    $scope.registrationForm = {};
    $scope.registrationFormValid = false;
    $scope.emailTextEnable = false;
    $scope.isEmpty = false;
    $scope.isPattern = false;
    $scope.isEmptyPassword = false;
    $scope.isPatternPassword = false;
    $scope.isLengthPassword = false;
    $scope.isEmptyfirstname = false;
    $scope.isEmptylastname = false;

    $scope.emailPattern = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    $scope.passwPattern = /(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z])/;
    $scope.phoneNumber = null;
    $scope.randomNum = {};
    $scope.allDone = false;
    var getRandomValues = function (field) {
        $scope.randomNum[field] = Math.random().toString();
    }

    $scope.UniqueEmail = function (emailAddress) {
        getRandomValues('email');
        $scope.emailLoading = true;
        if (emailAddress !== undefined && emailAddress !== null) {

            UserService.emailCheck(emailAddress, true).then(function (response) {
                getRandomValues('email');
                $scope.emailLoading = false;
                if (response.valid) {
                    $scope.emailAccepted = true;
                } else {
                    $scope.emailFailed = true;
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
    }
    $scope.registrationForm = {
        email: review.email,
        password: null,
        phoneNumber: ''
    };
    // Check if phone number is unique
    // ==============================
    $scope.phoneNumberDuplicate = false;
    $scope.phoneNumberLoading = false;
    $scope.phoneNumberAccepted = false;
    $scope.phoneNumberFailed = false;

    $scope.checkPhoneNumber = function (phoneNumber, PLength) {

        getRandomValues('phoneNumber');
        $scope.phoneNumberLoading = true;

        if (PLength != undefined && PLength != 0) {
            getRandomValues('phoneNumber');
            /*UserService.phoneCheck(phoneNumber, true).then(function (response) {            
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
        } else if ($scope.registrationForm.phoneNumber == '' && $scope.registrationForm.phoneNumber != undefined) {
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


    $scope.afterReviewSignup = function (isValid) {
        $scope.isEmptyfirstname = false;
        $scope.isEmptylastname = false;
        $scope.isEmptyConfirmPassword = false;
        $scope.passwordMismatch = false;

        if ($scope.registrationForm.firstname == "" || $scope.registrationForm.firstname == undefined) {
            $scope.isEmptyfirstname = true;
        }
        if ($scope.registrationForm.lastname == "" || $scope.registrationForm.lastname == undefined) {
            $scope.isEmptylastname = true;
        }
        if ($scope.registrationForm.password == "" || $scope.registrationForm.password == undefined) {
            $scope.isEmptyPassword = true;
        } else if ($scope.registrationForm.password.length < 8) {
            $scope.isLengthPassword = true;
        } else if (!$scope.passwPattern.test($scope.registrationForm.password)) {
            $scope.isPatternPassword = true;
        }
        if ($scope.registrationForm.confirmPassword == "" || $scope.registrationForm.confirmPassword == undefined) {
            $scope.isEmptyConfirmPassword = true;
        } else if (!$scope.isEmptyPassword && $scope.registrationForm.confirmPassword != $scope.registrationForm.password) {
            $scope.passwordMismatch = true;
        }

        if ($scope.isEmpty == false && $scope.isEmptyPassword == false && $scope.isPatternPassword == false && $scope.isLengthPassword == false && $scope.isEmptyfirstname == false && $scope.isEmptylastname == false && $scope.isEmptyConfirmPassword == false && $scope.passwordMismatch == false) {
            UserService.emailCheck($scope.registrationForm.email, true).then(function (response) {
                getRandomValues('email');
                $scope.emailLoading = false;
                if (response.valid) {
                    if (!$scope.phoneNumberFailed && !$scope.phoneNumberDuplicate) {
                        $scope.emailAccepted = true;
                        $scope.registrationFormValid = false;
                        $scope.allDone = true;
                        var userObj = {
                            userName: $scope.registrationForm.email,
                            pwdHash: $scope.registrationForm.password,
                            contactType: 'REVIEWER',
                            firstName: $scope.registrationForm.firstname,
                            lastName: $scope.registrationForm.lastname,
                            phoneNumber: $scope.registrationForm.phoneNumber,
                            verifyemail: false
                        }
                        UserService.signup(userObj).then(function (result) {
                            $rootScope.userData = result;
                            $cookies.put('token', result.token);
                            if (result.status == 'Registration successful!') {
                                $scope.allDone = true;
                                var reviewObj = {
                                    id: review.id,
                                    email: $scope.registrationForm.email,
                                    scoreFood: null,
                                    scoreService: null,
                                    scoreClean: null,
                                    token: result.contact != null ? result.contact.token : null,
                                    contactId: result.contact != null ? result.contact.id : null
                                }
                                UserService.updateReview(reviewObj)
                                    .then(function (result) {
                                        if (result.status == 'record updated') {
                                            window.location.href = '/auth/emailverification/checkemail';
                                            //$state.go('userRegistration.thanks');
                                            $scope.isRegisteredUser = true;
                                        } else {
                                            $scope.allDone = false;
                                        }
                                    });
                            }
                        });
                    }

                } else {
                    $scope.emailFailed = true;
                }

            });
        }
    };

    $scope.CheckEmail = function (value) {
        $scope.isEmpty = false;
        $scope.isPattern = false;
        if (value == "" || value == undefined) {
            $scope.isEmpty = true;
        } else if (!$scope.emailPattern.test(value)) {
            $scope.isPattern = true;
        }
    };

    $scope.CheckPassword = function (value) {
        $scope.isEmptyPassword = false;
        $scope.isPatternPassword = false;
        $scope.isLengthPassword = false;

        if (value == "" || value == undefined) {
            $scope.isEmptyPassword = true;
        } else if (value.length < 8) {
            $scope.isLengthPassword = true;
        } else if (!$scope.passwPattern.test(value)) {
            $scope.isPatternPassword = true;
        }

    };

    $scope.enableEmail = function () {
        $scope.emailTextEnable = true;

    };
    $scope.ChangeState = function (direction) {

        if (direction == 'next') {
            $state.go('userRegistration.thanks');

        }

    };

    $scope.doneFeedback = function () {
        $window.location.href = '/me/biz/search';
    };

    $timeout(function () {
        if (review.contactId !== null) {
            $state.go('userRegistration.thanks');
        }
    }, 500);


    $scope.resetPass = function () {
        $scope.isEmptyPassword = false;
        $scope.passwordMismatch = false;
    }

    $scope.$watch('registrationForm.firstname', function () {
        if ($scope.registrationForm.firstname != "") {
            $scope.isEmptyfirstname = false;
        }
    });

    $scope.$watch('registrationForm.lastname', function () {
        if ($scope.registrationForm.lastname != "") {
            $scope.isEmptylastname = false;
        }
    });

    $scope.$watch('registrationForm.confirmPassword', function () {
        if ($scope.registrationForm.confirmPassword != "") {
            $scope.isEmptyConfirmPassword = false;
            $scope.passwordMismatch = false;
        }
    });

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

}]);
