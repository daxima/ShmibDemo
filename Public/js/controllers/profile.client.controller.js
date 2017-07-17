app.controller('profileCtrl', ['$scope', '$state', '$cookies', '$rootScope', 'UserService', '$window', '$timeout', 'Upload', function ($scope, $state, $cookies, $rootScope, UserService, $window, $timeout, Upload) {

    $scope.emailPattern = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;

    // Only verified user can access this page
    if (user == undefined || user == null) {
        $window.location.href = '/auth/login/biz';
    }

    $scope.db = company;
    $scope.id = user.id;
    $scope.customLabel = customLabel;
    $scope.resMessage = false;
    $scope.isSuccess = false;
    $scope.resMessageContent = '';
    $scope.signupFormValid = false;
    $scope.randomNum = {};
    $scope.profileImageForDB = "";
    $scope.promotionImageForDB = "";
    $scope.isUnSupportedType = false;
    $scope.isPromotionImgUnSupported = false;
    var OrignalCellNumber = null;
    var OrignalPhoneNumber = null;
    $scope.maxCharLimit = 36; //max characters allowed for custom questions
    $scope.promotionTextCharLimit = 135; //max characters allowed for promotion text
    $scope.customfoodlabel = {
        Qfoodid: 1,
        Qfoodtext: null,
        QfoodIsActive: false
    };
    $scope.customservicelabel = {

        Qserviceid: 2,
        Qservicetext: null,
        QserviceIsActive: false
    };
    $scope.customcleanlabel = {
        Qcleanid: 3,
        Qcleantext: null,
        QcleanIsActive: false
    };

    if ($scope.db != null) {
        $scope.bizPlacesId = $scope.db.bizPlacesId;
        $scope.bizLat = $scope.db.bizLat;
        $scope.bizLng = $scope.db.bizLng;
        $scope.promotionText = $scope.db.promotionText;
    }

    if ($scope.customLabel != null) {
        for (var i = 0; i < $scope.customLabel.length; i++) {
            if ($scope.customLabel[i].Q_id == 1) {
                $scope.customfoodlabel.Qfoodtext = $scope.customLabel[i].Q_text;
            }
            if ($scope.customLabel[i].Q_id == 2) {
                $scope.customservicelabel.Qservicetext = $scope.customLabel[i].Q_text;
            }
            if ($scope.customLabel[i].Q_id == 3) {
                $scope.customcleanlabel.Qcleantext = $scope.customLabel[i].Q_text;
            }
        }

    }

    //function use to change arrayBuffer to base64 string
    function _arrayBufferToBase64(buffer) {
        var binary = '';
        var bytes = new Uint8Array(buffer);
        var len = bytes.byteLength;
        for (var i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }


    //functions use to encode/decode base64 string
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
    ///end function

    var base64String = "";
    var base64PromotionString = "";

    if ($scope.db.profileImage != null && $scope.db.profileImage.data.length > 0) {
        $scope.profileImageForDB = $scope.db.profileImage.data;
        base64String = _arrayBufferToBase64($scope.db.profileImage.data);
        base64String = Base64.decode(base64String);
        base64String = base64String.replace(/\s/g, '+');
    }

    if ($scope.db.promotionImage != null && $scope.db.promotionImage.data.length > 0) {
        $scope.promotionImageForDB = $scope.db.promotionImage.data;
        base64PromotionString = _arrayBufferToBase64($scope.db.promotionImage.data);
        base64PromotionString = Base64.decode(base64PromotionString);
        base64PromotionString = base64PromotionString.replace(/\s/g, '+');
    }



    $scope.business = {
        restaurantName: company.name,
        restype: company.bizType,
        foodtype: company.bizSubtype,
        pricelevel: company.pricelevel,
        address: company.streetAddress,
        city: company.city,
        state: company.state,
        zipcode: company.zip,
        phoneNumber: company.phoneNumber,
        email: company.email,
        urlName: company.urlName,
        enableNotifications: company.enableNotifications

    };
    OrignalPhoneNumber = $scope.business.phoneNumber;

    var host = $window.location.host;
    $scope.reviewLink = siteProtocol + host + '/biz/' + company.urlName + '/review'

    $scope.signup = {
        firstName: user.firstName,
        lastName: user.lastName,
        emailAddress: user.userName,
        cellNumber: user.phoneNumber
    };
    OrignalCellNumber = $scope.signup.cellNumber;

    var getRandomValues = function (field) {
        $scope.randomNum[field] = Math.random().toString();
    }

    $scope.emailLoading = false;
    $scope.emailAccepted = false;
    $scope.emailFailed = false;
    $scope.emailFailedUser = false;
    $scope.emailAcceptedUser = false;
    $scope.duplicateEmail = false;
    var isupdated = false;
    $scope.resetEmail = function () {
        $scope.resMessageContent = '';
        $scope.emailLoading = false;
        $scope.emailAccepted = false;
        $scope.emailFailed = false;
        $scope.emailFailedUser = false;
        $scope.emailAcceptedUser = false;
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
        $scope.resMessageContent = '';
        getRandomValues('phoneNumber');
        $scope.phoneNumberLoading = true;

        if (PLength != undefined && PLength != 0) {
            if (phoneNumber == OrignalPhoneNumber) {
                $scope.phoneNumberAccepted = true;
                return true;
            }
            /*UserService.phoneCheck(phoneNumber, false).then(function (response) {
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
        $scope.resMessageContent = '';
        $scope.phoneNumberLoading = false;
        $scope.phoneNumberAccepted = false;
        $scope.phoneNumberFailed = false;
        $scope.phoneNumberDuplicate = false;
    }

    // ==============================
    // Check if cell number is unique
    // ==============================

    $scope.cellNumberLoading = false;
    $scope.cellNumberAccepted = false;
    $scope.cellNumberFailed = false;

    $scope.cellNumberDuplicate = false;

    $scope.checkCellNumber = function (cellNumber, CLength) {
        $scope.resMessageContent = '';
        getRandomValues('cellNumber');
        $scope.cellNumberLoading = true;
        if (CLength != undefined && CLength != 0) {
            if (cellNumber == OrignalCellNumber) {
                $scope.cellNumberAccepted = true;
                return true;
            }
            /*UserService.phoneCheck(cellNumber, true).then(function (response) {
                getRandomValues('cellNumber');
                $scope.cellNumberLoading = false;
                if (response.valid) {
                    $scope.cellNumberAccepted = true;
                } else {
                    $scope.cellNumberDuplicate = true;
                }

            });*/
        } else if (CLength == 0) {
            $scope.cellNumberLoading = false;
            $scope.cellNumberFailed = false;
        } else {
            $scope.cellNumberLoading = true;
            $scope.cellNumberFailed = true;
        }
    }

    $scope.resetCellNumber = function () {
        $scope.resMessageContent = '';
        $scope.cellNumberLoading = false;
        $scope.cellNumberAccepted = false;
        $scope.cellNumberFailed = false;
        $scope.cellNumberDuplicate = false;
    }



    $scope.checkEmail = function (email) {
        $scope.resMessageContent = '';
        getRandomValues('email');
        $scope.emailLoading = true;
        var currentEmail = $scope.signup.emailAddress;
        var exitingEmail = user.userName;

        if (email !== undefined && email !== null) {

            UserService.emailCheck(email, false).then(function (response) {
                getRandomValues('email');
                $scope.emailLoading = false;
                if (response.valid) {
                    $scope.emailAccepted = true;
                    $scope.emailAcceptedUser = true;
                } else {
                    $scope.emailFailed = true;
                    $scope.emailFailedUser = true;

                }

            });
        } else {
            $scope.emailLoading = false;
            $scope.emailFailed = true;
            $scope.emailFailedUser = true;
        }
        if (currentEmail == exitingEmail) {
            isupdated = false;
            $scope.duplicateEmail = false;
        } else {
            isupdated = true;
            $scope.duplicateEmail = true;
        }

    }

    $scope.business.pricelevel = parseInt(company.pricelevel);

    $scope.UpdateProfile = function (isValidForm) {
        $scope.spinner = true;
        $scope.resMessageContent = '';
        $scope.validForm = true;
        if (isValidForm) {

            var bizType = '';
            var bizSubtype = '';
            for (obj in $scope.restype) {
                if ($scope.restype[obj].id == $scope.business.restype) {
                    bizType = $scope.restype[obj].refCode;
                    break;
                }
            }

            for (obj in $scope.foodtype) {
                if ($scope.foodtype[obj].id == $scope.business.foodtype) {
                    bizSubtype = $scope.foodtype[obj].refCode;
                    break;
                }
            }


            var profileObj = {
                id: $scope.id,
                companyId: $scope.db.id,
                name: $scope.business.restaurantName,
                bizType: bizType,
                bizSubtype: bizSubtype,
                pricelevel: $scope.db.priceLevel,
                streetAddress: $scope.business.address,
                city: $scope.business.city,
                state: $scope.business.state,
                zip: $scope.business.zipcode,
                firstName: $scope.signup.firstName,
                lastName: $scope.signup.lastName,
                userName: $scope.signup.emailAddress,
                cellNumber: $scope.signup.cellNumber,
                password: $scope.signup.password,
                phoneNumber: $scope.business.phoneNumber,
                email: $scope.business.email,
                contactType: 'COMPANY',
                token: user.token,
                profileImage: $scope.profileImageForDB,
                enableNotifications: $scope.business.enableNotifications,
                bizPlacesId: $scope.bizPlacesId,
                bizLat: $scope.bizLat,
                bizLng: $scope.bizLng,
                promotionImage: $scope.promotionImageForDB,
                promotionText: $scope.promotionText
            };

            if ($scope.customfoodlabel.Qfoodtext != null && $scope.customfoodlabel.Qfoodtext.trim() == '') {
                $scope.customfoodlabel.Qfoodtext = null;
            }
            if ($scope.customservicelabel.Qservicetext != null && $scope.customservicelabel.Qservicetext.trim() == '') {
                $scope.customservicelabel.Qservicetext = null;
            }
            if ($scope.customcleanlabel.Qcleantext != null && $scope.customcleanlabel.Qcleantext.trim() == '') {
                $scope.customcleanlabel.Qcleantext = null;
            }
            var f_Text = $scope.customfoodlabel.Qfoodtext;
            var s_Text = $scope.customservicelabel.Qservicetext;
            var c_Text = $scope.customcleanlabel.Qcleantext;

            profileObj.customLabel = [{
                    company_id: $scope.db.id,
                    Q_id: 1,
                    Q_text: f_Text
                },
                {
                    company_id: $scope.db.id,
                    Q_id: 2,
                    Q_text: s_Text
                },
                {
                    company_id: $scope.db.id,
                    Q_id: 3,
                    Q_text: c_Text
                }
                                    ];

            UserService.updateProject(profileObj).then(function (result) {
                $scope.resMessage = true;
                $scope.isSuccess = false;
                if (result.status == 200) {
                    $scope.resMessageContent = result.data.status;
                    $scope.spinner = false;
                } else if (result.status == 400) {
                    $scope.resMessageContent = result.data.message;
                    $scope.spinner = false;
                }
                $timeout(function () {
                    $scope.resMessageContent = '';
                }, 3000);
            });

        } else {
            $scope.signupFormValid = true;
            $scope.spinner = false;
        }


    };

    $scope.changePricelevel = function (number) {
        $scope.resMessageContent = '';
        if (number > 0) {
            $scope.db.priceLevel = number;
        }
    }


    UserService.getReferenceGroup('Business')
        .then(function (result) {
            $scope.restype = result;
            var data = {
                id: '',
                refCode: 'Business Type'
            };
            var arr = Array.prototype.slice.call($scope.restype);
            arr.unshift(data);

            $scope.restype = arr;

            for (obj in $scope.restype) {
                if ($scope.restype[obj].refCode == company.bizType) {
                    $scope.business.restype = $scope.restype[obj].id;
                    break;
                }
            }
        })

    UserService.getReferenceGroup('Food')
        .then(function (result) {
            $scope.foodtype = result;
            var data = {
                id: '',
                refCode: 'Food Type'
            };
            var arr = Array.prototype.slice.call($scope.foodtype);
            arr.unshift(data);

            $scope.foodtype = arr;


            for (obj in $scope.foodtype) {
                if ($scope.foodtype[obj].refCode == company.bizSubtype) {
                    $scope.business.foodtype = $scope.foodtype[obj].id;
                    break;
                }
            }
        });

    //Set the profile image
    if ($scope.db.profileImage != null && $scope.db.profileImage.data.length > 0) {
        $scope.profileImage = 'data:image/jpeg;base64,' + base64String;
    } else {
        $scope.profileImage = "images/profile_image_reviewer.png";
    }

    //Set the profile image
    if ($scope.db.promotionImage != null && $scope.db.promotionImage.data.length > 0) {
        $scope.promotionImage = 'data:image/jpeg;base64,' + base64PromotionString;
    }

    $scope.upload = function (file, invalidfile, isProfileImage) {
        if (isProfileImage)
            $scope.isUnSupportedType = false;
        else
            $scope.isPromotionImgUnSupported = false;

        if (invalidfile) {
            if (isProfileImage)
                $scope.isUnSupportedType = true;
            else
                $scope.isPromotionImgUnSupported = true;
        } else if (file) {
            var filetype = file.type.split('/')[1];
            var fileParts = file.name.split('.');
            var fileExtension = (fileParts[fileParts.length - 1]).toLowerCase();

            if (fileExtension !== 'jpg' && fileExtension !== 'jpeg' && fileExtension !== 'png' && fileExtension !== 'gif') {
                if (isProfileImage)
                    $scope.isUnSupportedType = true;
                else
                    $scope.isPromotionImgUnSupported = true;
            } else {
                if (!file.$error) {

                    Upload.base64DataUrl(file).then(function (base64Url) {
                            var base64URLM = base64Url;
                            var re = new RegExp("^data:image\/" + filetype + ";base64,", "g");
                            base64Url = base64Url.replace(re, "");
                            base64Url = base64Url.toString('binary');
                            if (isProfileImage) {
                                $scope.profileImageForDB = base64Url;
                                $scope.profileImage = base64URLM;
                            } else {
                                $scope.promotionImageForDB = base64Url;
                                $scope.promotionImage = base64URLM;
                            }

                        },
                        function (error) {});
                }
            }
        }
    };

    // Address Autocomplete code start
    // This example displays an address form, using the autocomplete feature
    // of the Google Places API to help users fill in the information.
    var placeSearch, autocomplete;
    var componentForm = {
        street_number: 'long_name',
        route: 'long_name',
        locality: 'long_name',
        administrative_area_level_1: 'short_name',
        postal_code: 'short_name'
    };

    $scope.placesVisited = false;

    $scope.initialize = function () {
        // function initialize() {
        // Create the autocomplete object, restricting the search
        // to geographical location types.
        var shortcountrycode = "US";
        var options = {
            types: ['address'],
            componentRestrictions: {
                country: shortcountrycode
            }
        };
        if ($scope.placesVisited === false) {
            $scope.placesVisited = true;
            autocomplete = new google.maps.places.Autocomplete(
                /** @type {HTMLInputElement} */
                (document.getElementById('street_address_long1')), options);


            // When the user selects an address from the dropdown,
            // populate the address fields in the form.
            google.maps.event.addListener(autocomplete, 'place_changed', function () {
                fillInAddress();
            });
        }
    }

    // [START region_fillform]
    function fillInAddress() {
        // Get the place details from the autocomplete object.
        var place = autocomplete.getPlace();


        if (place !== undefined || place !== null) {

            $scope.bizPlacesId = place.place_id;;
            $scope.bizLat = place.geometry.location.lat();
            $scope.bizLng = place.geometry.location.lng();


        } else {
            $scope.bizPlacesId = "";
            $scope.bizLat = "";
            $scope.bizLng = "";
        }

        // Get each component of the address from the place details
        // and fill the corresponding field on the form.
        for (var i = 0; i < place.address_components.length; i++) {
            var addressType = place.address_components[i].types[0];
            if (componentForm[addressType]) {
                var val = place.address_components[i][componentForm[addressType]];

                if (addressType == "route" && (place.address_components[0][componentForm['street_number']] !== val)) {
                    val = place.address_components[0][componentForm['street_number']] + ' ' + val;
                }
                if (addressType === "route") {
                    addressType = "street_address_long1";
                    $scope.business.address = val;
                }
                if (addressType === "locality") {
                    addressType = "city";
                    $scope.business.city = val;
                }
                if (addressType === "administrative_area_level_1") {
                    addressType = "state";
                    $scope.business.state = val;

                }
                if (addressType === "postal_code") {
                    addressType = "zipcode";
                    $scope.business.zipcode = val;
                }

                if (addressType !== "street_number") {
                    document.getElementById(addressType).value = val;
                }
            }
        }

        setTimeout(function () {
            $scope.$apply(function () {
                $('input[ng-model]').trigger('change');
            });
        }, 250);
    }
}]);
