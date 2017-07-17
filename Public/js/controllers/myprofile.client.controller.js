app.controller('myprofileCtrl', ['$scope', '$state', '$cookies', '$rootScope', 'UserService', '$window', '$timeout', 'Upload', function ($scope, $state, $cookies, $rootScope, UserService, $window, $timeout, Upload) {

    // Only verified user can access this page
    if (user == undefined || user == null) {
        $window.location.href = '/auth/login';
    }

    $scope.isBizContact = false;
    if (user.contactType.toUpperCase() == 'COMPANY')
        $scope.isBizContact = true;

    $scope.id = user.id;
    $scope.resMessage = false;
    $scope.isSuccess = false;
    $scope.resMessageContent = '';
    $scope.profileFormValid = false;
    $scope.randomNum = {};
    $scope.host = $window.location.host;
    $scope.IsCheckedEmail = false;
    $scope.reviewCount = user.reviewCount;
    $scope.Name = '';
    $scope.profileImage = '';
    $scope.profileImageForDB = null;
    var OrignalPhoneNumber = null;

    function _arrayBufferToBase64(buffer) {
        var binary = '';
        var bytes = new Uint8Array(buffer);
        var len = bytes.byteLength;
        for (var i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    var Base64 = {
        _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
        encode: function (input) {
            var output = "";
            var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
            var i = 0;
            input = Base64._utf8_encode(input);
            while (i < input.length) {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);
                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;
                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }
                output = output + this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) + this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

            }

            return output;
        },


        decode: function (input) {
            var output = "";
            var chr1, chr2, chr3;
            var enc1, enc2, enc3, enc4;
            var i = 0;
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
            while (i < input.length) {
                enc1 = this._keyStr.indexOf(input.charAt(i++));
                enc2 = this._keyStr.indexOf(input.charAt(i++));
                enc3 = this._keyStr.indexOf(input.charAt(i++));
                enc4 = this._keyStr.indexOf(input.charAt(i++));
                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;
                output = output + String.fromCharCode(chr1);
                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }
            }
            output = Base64._utf8_decode(output);
            return output;
        },

        _utf8_encode: function (string) {
            string = string.replace(/\r\n/g, "\n");
            var utftext = "";
            for (var n = 0; n < string.length; n++) {
                var c = string.charCodeAt(n);
                if (c < 128) {
                    utftext += String.fromCharCode(c);
                } else if ((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
                } else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
                }

            }

            return utftext;
        },

        _utf8_decode: function (utftext) {
            var string = "";
            var i = 0;
            var c = c1 = c2 = 0;
            while (i < utftext.length) {
                c = utftext.charCodeAt(i);
                if (c < 128) {
                    string += String.fromCharCode(c);
                    i++;
                } else if ((c > 191) && (c < 224)) {
                    c2 = utftext.charCodeAt(i + 1);
                    string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                    i += 2;
                } else {
                    c2 = utftext.charCodeAt(i + 1);
                    c3 = utftext.charCodeAt(i + 2);
                    string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                    i += 3;
                }

            }

            return string;
        }

    }
    var base64String = "";

    if (user.profileImage != null && user.profileImage.data.length > 0) {
        $scope.profileImageForDB = user.profileImage.data;
        base64String = _arrayBufferToBase64(user.profileImage.data);
        base64String = Base64.decode(base64String);
        base64String = base64String.replace(/\s/g, '+');
    }

    if (user.firstName != null || user.firstName != undefined)
        $scope.Name = user.firstName + ' ' + user.lastName;
    else
        $scope.Name = user.userName;

    var getRandomValues = function (field) {
        $scope.randomNum[field] = Math.random().toString();
    }

    $scope.phoneNumberFailed = false;
    $scope.phoneNumberLoading = false;
    $scope.phoneNumberDuplicate = false;


    $scope.resetPhoneNumber = function () {
        $scope.resMessageContent = '';
        $scope.phoneNumberLoading = false;
        $scope.phoneNumberAccepted = false;
        $scope.phoneNumberFailed = false;
        $scope.phoneNumberDuplicate = false;
    }

    $scope.checkPhoneNumber = function (phoneNumber, PLength) {
        $scope.resMessageContent = '';
        getRandomValues('phoneNumber');
        $scope.phoneNumberLoading = true;

        if (PLength != undefined && PLength != 0) {
            if (phoneNumber == OrignalPhoneNumber) {
                $scope.phoneNumberAccepted = true;
                return true;
            }
            UserService.phoneCheck(phoneNumber, true).then(function (response) {
                getRandomValues('phoneNumber');
                $scope.phoneNumberLoading = false;
                if (response.valid) {
                    $scope.phoneNumberAccepted = true;
                } else {
                    $scope.phoneNumberDuplicate = true;
                }

            });
        } else if (PLength == 0) {
            $scope.phoneNumberLoading = false;
            $scope.phoneNumberFailed = false;
        } else {
            $scope.phoneNumberLoading = true;
            $scope.phoneNumberFailed = true;
        }
    }

    if (user.profileImage != null && user.profileImage.data.length > 0) {
        $scope.profileImage = 'data:image/png;base64,' + base64String;
    } else {
        $scope.profileImage = "images/profile_image_reviewer.png";
    }


    $scope.upload = function (file, invalidfile) {

        if (invalidfile) {
            $scope.isUnSupportedType = true;
        } else if (file) {
            var filetype = file.type.split('/')[1];
            var fileParts = file.name.split('.');
            var fileExtension = (fileParts[fileParts.length - 1]).toLowerCase();

            if (fileExtension !== 'jpg' && fileExtension !== 'jpeg' && fileExtension !== 'png' && fileExtension !== 'gif') {
                $scope.isUnSupportedType = true;
            } else {
                if (!file.$error) {

                    Upload.base64DataUrl(file).then(function (base64Url) {
                            $scope.isUnSupportedType = false;
                            var base64URLM = base64Url;
                            var re = new RegExp("^data:image\/" + filetype + ";base64,", "g");
                            base64Url = base64Url.replace(re, "");
                            base64Url = base64Url.toString('binary');
                            $scope.profileImageForDB = base64Url;
                            $scope.profileImage = base64URLM;
                        },
                        function (error) {});
                }
            }
        }
    };

    $scope.closeEMsg = function () {
        $scope.isUnSupportedType = false;
    };

    $scope.signup = {
        firstName: user.firstName,
        lastName: user.lastName,
        emailAddress: user.userName,
        phoneNumber: user.phoneNumber,
        enableNotifications: user.enableNotifications
    };
    OrignalPhoneNumber = $scope.signup.phoneNumber;

    $scope.UpdateProfile = function (isValidForm) {
        $scope.spinner = true;
        $scope.validForm = true;
        if (isValidForm && $scope.IsCheckedEmail != true) {


            var profileObj = {
                id: $scope.id,
                firstName: $scope.signup.firstName,
                lastName: $scope.signup.lastName,
                userName: $scope.signup.emailAddress,
                phoneNumber: $scope.signup.phoneNumber,
                password: $scope.signup.password,
                token: user.token,
                profileImage: $scope.profileImageForDB,
                enableNotifications: $scope.signup.enableNotifications

            };

            UserService.updateUserProfile(profileObj).then(function (result) {
                $scope.resMessage = true;
                $scope.resMessageContent = 'Profile updated successfully.';
                if (result.status == "update successful!") {
                    $scope.isSuccess = false;
                    $scope.spinner = false;
                }
                $timeout(function () {
                    $scope.resMessageContent = '';
                }, 3000);
            });
        } else {
            $scope.profileFormValid = true;
            $scope.spinner = false;
        }
    };

    $scope.getMyReview = function () {
        $window.location.href = '/me/review/list';
    }

}]);
