app.controller('userReview', ['$scope', '$uibModal', '$window', '$state', 'UserService', 'Upload', '$timeout', '$location', '$rootScope', '$route', 'deviceDetector', '$cookies', function ($scope, $uibModal, $window, $state, UserService, Upload, $timeout, $location, $rootScope, $route, deviceDetector, $cookies) {

    $scope.emailPattern = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;

    $scope.formData = {};
    $scope.formData.screenNumber = 1;
    $scope.signupFormValid = false;
    $scope.forms = {};
    $scope.current = $state.current;
    $scope.userid = null;
    $scope.showNavigation = true;
    $scope.customLabel = customLabel;
    $scope.FoodText = null;
    $scope.ServiceText = null;
    $scope.CleanText = null;
    $scope.isSendDisabled = false;
    $scope.imageNeedToUpload = null;
    $scope.imagesNeedToUpload = [];
    $scope.uploadedImages = 0;
    $scope.promises = []
    $scope.cForm = {
        ufile: null
    }
    $scope.isUnSupportedType = false;

    $scope.isFoodQuesCustom = false;
    $scope.isServiceQuesCustom = false;
    $scope.isCleanQuesCustom = false;

    $scope.questionIcon = "";
    $scope.isShowLogo = false;

    $scope.restaurantName = restaurantName;
    $scope.streetAddress = streetAddress;
    $scope.city = city;
    $scope.state = state;
    $scope.zip = zip;
    $scope.biztype = biztype;
    $scope.isDesktop = deviceDetector.isDesktop();
    $scope.device = deviceDetector.device;

    $scope.showInstallAppPopUpAndroid = function () {
        var scope = $scope.$new();

        var tempUrl = '/views/installappAndroid.modal.client.view.html';

        var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            scope: scope,
            size: 'md',
            templateUrl: tempUrl,
            controller: 'InstallAppModalInstanceCtrl'
        });

        modalInstance.result.then(function () {}, function () {});
    }

    $scope.showInstallAppPopUpIOS = function () {
        var scope = $scope.$new();

        var tempUrl = '/views/installappIOS.modal.client.view.html';

        var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            scope: scope,
            size: 'md',
            templateUrl: tempUrl,
            controller: 'InstallAppModalInstanceCtrl'
        });

        modalInstance.result.then(function () {}, function () {});
    }

    /*
    if (!$scope.isDesktop) {
        if ($scope.device == "ipad" || $scope.device == "iphone")
            $scope.showInstallAppPopUpIOS();
        if ($scope.device == "android")
            $scope.showInstallAppPopUpAndroid();
    }
    */
    
    if ($scope.customLabel != null && $scope.customLabel.length > 0) {
        for (var i = 0; i < $scope.customLabel.length; i++) {
            if ($scope.customLabel[i].Q_id == 1 && $scope.customLabel[i].Q_text != "")
                $scope.FoodText = $scope.customLabel[i].Q_text;
            if ($scope.customLabel[i].Q_id == 2 && $scope.customLabel[i].Q_text != "")
                $scope.ServiceText = $scope.customLabel[i].Q_text;
            if ($scope.customLabel[i].Q_id == 3 && $scope.customLabel[i].Q_text != "")
                $scope.CleanText = $scope.customLabel[i].Q_text;
        }

        $scope.isFoodQuesCustom = $scope.FoodText == null || $scope.FoodText == '' ? false : true;
        $scope.isServiceQuesCustom = $scope.ServiceText == null || $scope.ServiceText == '' ? false : true;
        $scope.isCleanQuesCustom = $scope.CleanText == null || $scope.CleanText == '' ? false : true;

    }

    if (user) {
        $scope.formData.email = (user.verifyemail == true) ? user.userName : null;
        $scope.userid = user == null ? null : user.id;
        $scope.verifyemail = user.verifyemail;
    }

    if ($scope.biztype != 'Restaurant') {
        $scope.isShowLogo = true;
    }

    $scope.initFiles = function (file, invalidfile) {
        $scope.imageNeedToUpload = file;
        $scope.isUnSupportedType = false;

        if (invalidfile)
            $scope.isUnSupportedType = true;

        else if ($scope.imageNeedToUpload != null) {

            var fileParts = file.name.split('.');
            var fileExtension = (fileParts[fileParts.length - 1]).toLowerCase();

            if (fileExtension !== 'jpg' && fileExtension !== 'jpeg' && fileExtension !== 'png' && fileExtension !== 'gif') {
                $scope.isUnSupportedType = true;
            } else {

                $scope.imagesNeedToUpload.push(file);
            }
        }
    };

    var x = 0;
    $scope.imagesUploaded = x;
    var loopArray = function (arr) {
        $scope.uploadImage(arr[x], function () {

            x++;
            $scope.imagesUploaded = x;
            if (x < arr.length) {
                loopArray(arr);
            } else {
                if (!user) {
                    $window.location.href = '/help/signup/review/' + $scope.reviewId;
                } else {
                    $scope.isRegisteredUser = true;
                    $state.go('userReview.complete');
                }
            };
        });
    }


    $scope.uploadImage = function (img, callback) {
        var imgTU = '';
        imgTU = img;
        var filetype = imgTU.type.split('/')[1];

        Upload.base64DataUrl(imgTU).then(function (base64Url) {

            var base64URLM = base64Url;
            var re = new RegExp("^data:image\/" + filetype + ";base64,", "g");
            base64Url = base64Url.replace(re, "");
            base64Url = base64Url.toString('binary');

            var CommentObj = {
                reviewId: $scope.reviewId,
                description: null,
                createdBy: user != null ? user.id : null,
                token: user != null ? user.token : null,
                isBizComment: false,
                sendNotification: false,
                file_data: base64Url,
                file_name: imgTU.name
            };

            $scope.uploadedImages++;

            UserService.sendComment(CommentObj).then(function (results) {
                callback();
            });
        });
    }

    $scope.processForm = function (isValid) {
        if (isValid) {
            $scope.isSendDisabled = true;
            $scope.spinner = true;
            var reviewObj = {
                company: restaurant,
                email: $scope.formData.email,
                contactId: $scope.userid,
                contactInfoType: 'EMAIL',
                scoreFood: $scope.formData.foodscore,
                scoreService: $scope.formData.servicescore,
                scoreClean: $scope.formData.cleanscore,
                description: $scope.formData.comment,
                question1: $scope.FoodText,
                question2: $scope.ServiceText,
                question3: $scope.CleanText
            }


            UserService.saveReview(reviewObj).then(function (response) {

                if (response.status == 'Review added successfully!') {

                    $scope.formData.foodscore = null;
                    $scope.formData.servicescore = null;
                    $scope.formData.cleanscore = null;
                    $scope.formData.screenNumber = 5;

                    $scope.reviewId = response.reviewId;
                    $scope.bizId = response.bizId;

                    var userToken = $cookies.get('token');
                    if (userToken == undefined) {
                        $cookies.put('token', response.uuid);
                    }
                }

            }).then(function () {
                // This block of code should be executed if there is any image
                if ($scope.imagesNeedToUpload.length > 0) {
                    loopArray($scope.imagesNeedToUpload);
                } else {
                    $scope.spinner = false;
                    // Below clock of code should be commented out if above code is uncommented
                    if (!user) {
                        $window.location.href = '/help/signup/review/' + $scope.reviewId;
                    } else {
                        $scope.isRegisteredUser = true;
                        $state.go('userReview.complete');
                    }
                }
            });
        } else {
            $scope.signupFormValid = true;
        }
    };



    $scope.updateScreenNumber = function (isValid) {

        $scope.formData.screenNumber++;
        $scope.showNavigation = true;
        $state.go('userReview.food');
        $scope.signupFormValid = true;
    };

    $scope.setRating = function (obj, rating) {

        $scope.formData[obj] = rating;
        $timeout(function () {
            $scope.ChangeState('next');
        }, 400)

    }

    $scope.$on('$locationChangeStart', function (event, next, current) {
        if (next == current) {
            var path = $location.path();
            if (path == '/reviewfood' || path == '/reviewservice' || path == '/reviewclean' || path == '/reviewprofile' || path == '/')
                $window.location.href = '/biz/' + restaurant + '/review';
        }
    });

    $rootScope.$on('$locationChangeSuccess', function () {
        $rootScope.actualLocation = $location.path();
    });

    $rootScope.$watch(function () {
        return $location.path()
    }, function (newLocation, oldLocation) {
        if ($rootScope.actualLocation === newLocation) {
            $scope.ChangeState('back');
        }
    });

    $scope.SKIP = function (direction) {
        $scope.ChangeState('next');
    }

    $scope.ChangeState = function (direction) {

        if (direction == 'next') {
            $scope.formData.screenNumber++;
        } else {
            $scope.formData.screenNumber--;
        }

        switch ($scope.formData.screenNumber) {
            case 1:
                $state.go('userReview');
                $scope.showNavigation = true;
                break;
            case 2:
                $state.go('userReview.food');
                $scope.showNavigation = true;
                break;
            case 3:
                $state.go('userReview.service');
                $scope.showNavigation = true;
                break;
            case 4:
                $state.go('userReview.clean');
                $scope.showNavigation = true;
                break;
            case 5:
                $state.go('userReview.comment');
                $scope.signupFormValid = false;
                $scope.showNavigation = true;
                break;
            default:
                $window.location.href = '/me/biz/search';
                break;
        }
    }

    $scope.doneFeedback = function () {
        $window.location.href = '/me/biz/search';
    };


    // Common methods handling image encode/decode
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

    if (promotionImage != null && promotionImage.data.length > 0) {
        base64String = _arrayBufferToBase64(promotionImage.data);
        base64String = Base64.decode(base64String);
        base64String = base64String.replace(/\s/g, '+');
        $scope.promotionImage = 'data:image/jpeg;base64,' + base64String;
    }

    $scope.promotionText = promotionText;
}]);
