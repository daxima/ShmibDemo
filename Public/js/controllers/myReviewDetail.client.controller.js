app.controller('MyreviewsdetailCtrl', ['$scope', '$state', '$stateParams', '$cookies', '$http', 'UserService', '$rootScope', '$window', 'lodash', 'Upload', '$timeout', '$uibModal', function ($scope, $state, $stateParams, $cookies, $http, UserService, $rootScope, $window, lodash, Upload, $timeout, $uibModal) {

    $scope.token = $window.location.search;

    var token = ''; //$cookies.get('token');

    if ($scope.token) {
        token = $scope.token.split('=')[1];
        $cookies.put('token', token);
    };

    $scope.ReviewCommt = '';
    $scope.today = new Date();

    if (user) {
        $scope.loginuser = user.id;
        $scope.cType = user.contactType;
    }

    $scope.Name = '';
    $scope.reviewComment = [];
    $scope.customLabel = [];
    $scope.Review = [];
    $scope.pushRank = {};
    $scope.avgStarReview = [];
    $scope.rdFoodRating = [];
    $scope.rdCleannessRating = [];
    $scope.rdServiceRating = [];
    $scope.reviewComment = reviewComment;
    $scope.Review = reviewDetail;
    $scope.companyName = companyName;
    $scope.profileImageFromDB = profileImage;
    $scope.profileImage = null;
    $scope.bizType = biztype;

    $scope.Question1 = null;
    $scope.Question2 = null;
    $scope.Question3 = null;

    $scope.isFoodQuesCustom = false;
    $scope.isServiceQuesCustom = false;
    $scope.isCleanQuesCustom = false;

    $scope.isShowLogo = false;

    var orderComment = function () {
        if ($scope.reviewComment != null)
            $scope.reviewComment = lodash.orderBy($scope.reviewComment, 'id', 'asc');
        $scope.isNewComment = false;
    }

    //custom question
    $scope.Question1 = $scope.Review.question1;
    $scope.Question2 = $scope.Review.question2;
    $scope.Question3 = $scope.Review.question3;

    if ($scope.Question1 == null || $scope.Question1 == '')
        $scope.Question1 = 'Value?';
    else
        $scope.isFoodQuesCustom = true;

    if ($scope.Question2 == null || $scope.Question2 == '')
        $scope.Question2 = 'Service?';
    else
        $scope.isServiceQuesCustom = true;

    if ($scope.Question3 == null || $scope.Question3 == '')
        $scope.Question3 = 'Overall Experience?';
    else
        $scope.isCleanQuesCustom = true;

    if ($scope.bizType != 'Restaurant') {
        $scope.isShowLogo = true;
    }

    $scope.Review.scoreFood = $scope.Review.scoreFood == null ? 0 : $scope.Review.scoreFood;
    $scope.Review.scoreService = $scope.Review.scoreService == null ? 0 : $scope.Review.scoreService;
    $scope.Review.scoreClean = $scope.Review.scoreClean == null ? 0 : $scope.Review.scoreClean;

    var avgReview = parseFloat((parseInt($scope.Review.scoreFood) + parseInt($scope.Review.scoreService) + parseInt($scope.Review.scoreClean)) / 3);
    getStar(avgReview);
    $scope.avgStarReview = $scope.pushRank;

    if ($scope.Review.scoreFood != null || $scope.Review.scoreFood != undefined) {
        getStar(parseInt($scope.Review.scoreFood));
        $scope.rdFoodRating = $scope.pushRank;
    } else {
        getStar(0);
        $scope.rdFoodRating = $scope.pushRank;
    }

    if ($scope.Review.scoreService != null || $scope.Review.scoreService != undefined) {
        getStar(parseInt($scope.Review.scoreService));
        $scope.rdServiceRating = $scope.pushRank;
    } else {
        getStar(0);
        $scope.rdServiceRating = $scope.pushRank;
    }

    if ($scope.Review.scoreClean != null || $scope.Review.scoreClean != undefined) {
        getStar(parseInt($scope.Review.scoreClean));
        $scope.rdCleannessRating = $scope.pushRank;
    } else {
        getStar(0);
        $scope.rdCleannessRating = $scope.pushRank;
    }
    $scope.reset = function () {
        $scope.ReviewCommt = "";

    };

    $scope.rFile = '';

    //Profile Image
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

    if ($scope.profileImageFromDB != null && $scope.profileImageFromDB.data.length > 0) {
        base64String = _arrayBufferToBase64($scope.profileImageFromDB.data);
        base64String = Base64.decode(base64String);
        base64String = base64String.replace(/\s/g, '+');

        $scope.profileImage = 'data:image/png;base64,' + base64String;
    } else {
        $scope.profileImage = "images/profile_image_biz.png";
    }
    //End Profile Image

    var decodeUploadedImage = function () {
        if($scope.reviewComment){
            for (var index = 0; index < $scope.reviewComment.length; index++) {
                if ($scope.reviewComment[index].uploadedImage != null && $scope.reviewComment[index].uploadedImage.data.length > 0) {
                    base64String = _arrayBufferToBase64($scope.reviewComment[index].uploadedImage.data);
                    base64String = Base64.decode(base64String);
                    base64String = base64String.replace(/\s/g, '+');
                    $scope.reviewComment[index].commentWithImage = 'data:image/jpeg;base64,' + base64String;
                }
            }
        }
    }

    $scope.isNewComment = false;
    $scope.Send = function (commType, invalidfile) {
        $scope.isNewComment = true;
        var isvalidInputs = false;
        if (commType == 'text') {
            if ($scope.ReviewCommt != "") {
                var CommentObj = {
                    reviewId: $scope.Review.id,
                    description: $scope.ReviewCommt,
                    files: null,
                    createdBy: user != null ? user.id : null,
                    token: user != null ? user.token : null,
                    isBizComment: false,
                    sendNotification: true
                };
                UserService.sendComment(CommentObj).then(function (results) {
                    $scope.ReviewCommt = '';
                    $scope.reviewComment = [];
                    $scope.reviewComment = results.reviewComment;
                }).then(function () {
                    decodeUploadedImage();
                    orderComment();
                });
            }
        } else {
            var sfile = commType;
            if (invalidfile) {
                showUnsupportedDialog();
            } else if (sfile) {

                var filetype = sfile.type.split('/')[1];
                var fileParts = sfile.name.split('.');
                var fileExtension = (fileParts[fileParts.length - 1]).toLowerCase();

                if (fileExtension !== 'jpg' && fileExtension !== 'jpeg' && fileExtension !== 'png' && fileExtension !== 'gif') {
                    showUnsupportedDialog();
                } else {
                    $scope.imageUploaded = null;
                    if (!sfile.$error) {

                        var otherData = {
                            bizId: $scope.Review.companyId,
                            reviewId: $scope.Review.id
                        };

                        Upload.base64DataUrl(sfile).then(function (base64Url) {

                                var base64URLM = base64Url;
                                var re = new RegExp("^data:image\/" + filetype + ";base64,", "g");
                                base64Url = base64Url.replace(re, "");
                                base64Url = base64Url.toString('binary');
                                $scope.imageUploaded = base64Url;
                            },
                            function (error) {}).then(function () {
                            var CommentObj = {
                                reviewId: $scope.Review.id,
                                description: null,
                                createdBy: user != null ? user.id : null,
                                token: user != null ? user.token : null,
                                isBizComment: false,
                                sendNotification: true,
                                file_data: $scope.imageUploaded,
                                file_name: sfile.name
                            }
                            UserService.sendComment(CommentObj).then(function (results) {

                                $scope.ReviewCommt = '';
                                $scope.reviewComment = [];
                                $scope.reviewComment = results.reviewComment;
                            }).then(function () {
                                decodeUploadedImage();
                                orderComment();
                            });
                        });
                    }
                }
            }
        }
    };


    $scope.getMyReview = function () {
        $window.location.href = '/me/review/list';
    }

    function getStar(number) {
        var totalnumber = Math.round(number);
        $scope.pushRank = {};
        switch (totalnumber) {
            case 1:
                $scope.pushRank = [{
                        id: 1,
                        star: 'glyphicon glyphicon-star'
                    },
                    {
                        id: 2,
                        star: 'glyphicon glyphicon-star opacity_half'
                    },
                    {
                        id: 3,
                        star: 'glyphicon glyphicon-star opacity_half'
                    },
                    {
                        id: 4,
                        star: 'glyphicon glyphicon-star opacity_half'
                    },
                    {
                        id: 5,
                        star: 'glyphicon glyphicon-star opacity_half'
                    }];
                break;
            case 2:
                $scope.pushRank = [{
                        id: 1,
                        star: 'glyphicon glyphicon-star'
                    },
                    {
                        id: 2,
                        star: 'glyphicon glyphicon-star'
                    },
                    {
                        id: 3,
                        star: 'glyphicon glyphicon-star opacity_half'
                    },
                    {
                        id: 4,
                        star: 'glyphicon glyphicon-star opacity_half'
                    },
                    {
                        id: 5,
                        star: 'glyphicon glyphicon-star opacity_half'
                    }];
                break;
            case 3:
                $scope.pushRank = [{
                        id: 1,
                        star: 'glyphicon glyphicon-star'
                    },
                    {
                        id: 2,
                        star: 'glyphicon glyphicon-star'
                    },
                    {
                        id: 3,
                        star: 'glyphicon glyphicon-star'
                    },
                    {
                        id: 4,
                        star: 'glyphicon glyphicon-star opacity_half'
                    },
                    {
                        id: 5,
                        star: 'glyphicon glyphicon-star opacity_half'
                    }];
                break;
            case 4:
                $scope.pushRank = [{
                        id: 1,
                        star: 'glyphicon glyphicon-star'
                    },
                    {
                        id: 2,
                        star: 'glyphicon glyphicon-star'
                    },
                    {
                        id: 3,
                        star: 'glyphicon glyphicon-star'
                    },
                    {
                        id: 4,
                        star: 'glyphicon glyphicon-star'
                    },
                    {
                        id: 5,
                        star: 'glyphicon glyphicon-star opacity_half'
                    }];
                break;
            case 5:
                $scope.pushRank = [{
                        id: 1,
                        star: 'glyphicon glyphicon-star'
                    },
                    {
                        id: 2,
                        star: 'glyphicon glyphicon-star'
                    },
                    {
                        id: 3,
                        star: 'glyphicon glyphicon-star'
                    },
                    {
                        id: 4,
                        star: 'glyphicon glyphicon-star'
                    },
                    {
                        id: 5,
                        star: 'glyphicon glyphicon-star'
                    }];
                break;
            default:
                $scope.pushRank = [{
                        id: 1,
                        star: 'glyphicon glyphicon-star opacity_half'
                    },
                    {
                        id: 2,
                        star: 'glyphicon glyphicon-star opacity_half'
                    },
                    {
                        id: 3,
                        star: 'glyphicon glyphicon-star opacity_half'
                    },
                    {
                        id: 4,
                        star: 'glyphicon glyphicon-star opacity_half'
                    },
                    {
                        id: 5,
                        star: 'glyphicon glyphicon-star opacity_half'
                    }];
                break;
        }
    }

    decodeUploadedImage();
    orderComment();

    $scope.animationsEnabled = false;

    function showUnsupportedDialog() {
        var scope = $scope.$new();

        var tempUrl = '/views/alert.client.view.html';

        scope.params = {
            title: 'Unsupported File Format',
            message: 'Only GIF, JPG, JPEG and PNG are allowed'
        };
        var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            scope: scope,
            size: 'sm',
            templateUrl: tempUrl,
            controller: 'AlertModalInstanceCtrl'
        });

        modalInstance.result.then(function () {}, function () {});
    };

}]);
