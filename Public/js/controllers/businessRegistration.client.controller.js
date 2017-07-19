app.controller('businessRegistrationCtrl', ['$scope', '$state', 'UserService', '$cookies', '$rootScope', '$window', '$stateParams', '$location', 'lodash', function ($scope, $state, UserService, $cookies, $rootScope, $window, $stateParams, $location, lodash) {

    $scope.emailPattern = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;

    $rootScope.signedUp = true;
    $scope.hasSelectedBiz = false;

    if (user != null) {
        $rootScope.signupUser = user.firstName == null ? user.userName : user.firstName;
    }

    $scope.isBusiness = true;
    $scope.addBussinessFormValid = false;
    //    $scope.addAnotherBiz = $location.search();

    // Only verified user can access this page
    UserService.getUserProfile().then(function (result) {
        if (result.status == 400) {
            $window.location.href = '/auth/login/biz';
        }
    });

    $scope.business = {
        name: null,
        bizType: null,
        bizSubtype: null,
        priceLevel: null,
        urlName: null,
        Address: null,
        city: null,
        state: null,
        zip: null,
        phoneNumber: ''
    }


    $scope.webaddress = {
        text: 'guest',
        word: /^\s*\w*\s*$/
    };


    $scope.bizPlacesId = "";
    $scope.bizLat = "";
    $scope.bizLng = "";

    var getRandomValues = function (field) {
        $scope.randomNum[field] = Math.random().toString();
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
            $scope.business.restype = $scope.restype[0].id;

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
            $scope.business.foodtype = $scope.foodtype[0].id;
        })


    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
                //alert('Geolocation is supported! before $aply');
                $scope.$apply(function () {
                    $scope.position = position;
                    $scope.geoPermission = true;
                    $scope.geoLng = position.coords.longitude;
                    $scope.geoLat = position.coords.latitude;
                    // Load default company on page load
                    //alert('Geolocation is supported! '+ $scope.geoLng+' '+ $scope.geoLat);
                    //                    $scope.GoogleSearch('restaurant', $scope.geoLng, $scope.geoLat);

                });
            },
            function (error) {
                if (error.code == error.PERMISSION_DENIED) {
                    $scope.geoPermission = false;
                    console.log('Geolocation is not supported for this Browser/OS version yet / Permission denied ' + error);
                    //console.log("you denied me :-(");
                }
            });
    }

    $scope.getCityName = function (text) {
        $scope.hasSelectedCity = false;
        return UserService.bizGoogleSearchCities(text).then(function (results) {
            $scope.resMessage = false;
            $scope.cityList = [];
            $scope.cityNameList = [];

            if (results.googleCityObjTrim.length > 0) {

                for (var i = 0; i < results.googleCityObjTrim.length; i++) {
                    var cityObjList = {
                        cityPlacesId: null,
                        cityName: null,
                        cityLat: null,
                        cityLng: null,
                        cityReference: null
                    }


                    cityObjList.cityPlacesId = results.googleCityObjTrim[i].place_id;
                    cityObjList.cityName = results.googleCityObjTrim[i].description;
                    cityObjList.cityLat = results.googleCityObjTrim[i].lat;
                    cityObjList.cityLng = results.googleCityObjTrim[i].lng;
                    cityObjList.cityReference = results.googleCityObjTrim[i].reference;

                    $scope.cityList.push(cityObjList);
                    $scope.cityNameList.push(cityObjList.cityName);
                }
            } else {
                $scope.resMessage = true;
            }

            // "place_id": "ChIJn4Q6Qh9cDogR0a4P7KCLA7A",
            // "description": "Romeoville, IL",
            // "reference": "CjQmAAAAPO4Q4BuYty78RPQYpyGrKzW5y9wEzk3CwWAEzihFVCTO9jHuM98hOhm61mFSwHOyEhB3GZx-YEBeYXcD_nRLvdt8GhSof0zeEApEUs-DUNzNx85vK1XryQ",
            // "lng": -88.0895061,
            // "lat": 41.6475306
            var items = [];
            return $scope.cityList.map(function (item) {
                items = item
                return items;
            });
        });
    }

    var clearFields = function () {
        $scope.business.id = 0;
        $scope.bizPlacesId = null;
        $scope.bizLat = null;
        $scope.bizLng = null;
        $scope.business.address = null;
        $scope.business.city = null;
        $scope.business.state = null;
        $scope.business.zipcode = null;
        $scope.errorMessage = '';
    }


    $scope.onSelectCity = function ($item) {
        clearFields();
        $scope.business.restaurantName = null;
        //clear the fields
        // console.log(' $scope.geoLat'+  $scope.geoLat);
        // console.log(' $scopegeoLng'+  $scope.geoLng);

        // $scope.geoLat = null;
        // $scope.geoLng = null;
        // console.log('$item');
        // console.log($item);

        $scope.geoLat = $item.cityLat;
        $scope.geoLng = $item.cityLng;

        // console.log(' $scope.geoLat'+  $scope.geoLat);
        // console.log(' $scopegeoLng'+  $scope.geoLng);

        $scope.hasSelectedCity = true;
    };

    $scope.getBizName = function (text) {
        $scope.hasSelectedBiz = false;
        console.log(' $scope.geoLat' + $scope.geoLat);
        console.log(' $scopegeoLng' + $scope.geoLng);
        return UserService.bizGoogleSearch(text, $scope.geoLat, $scope.geoLng).then(function (results) {
            $scope.resMessage = false;
            $scope.businessList = [];
            $scope.businessNameList = [];

            //console.log("results.googleCompObjTrim.length = " + results.googleCompObjTrim.length);

            if (results.googleCompObjTrim.length > 0) {

                for (var i = 0; i < results.googleCompObjTrim.length; i++) {
                    var bObjList = {
                        companyId: null,
                        companyname: null,
                        urlname: null,
                        address: null
                    }
                    bObjList.companyId = results.googleCompObjTrim[i].id;
                    bObjList.companyname = results.googleCompObjTrim[i].name;
                    bObjList.urlname = results.googleCompObjTrim[i].urlName;

                    //                    if (results.googleCompObjTrim[i].id === 0) {
                    //                        bObjList.address = 'From Google: ' + results.googleCompObjTrim[i].fullStreetAddress;
                    //                    } else {
                    bObjList.address = results.googleCompObjTrim[i].fullStreetAddress;
                    //                    }
                    bObjList.bizPlacesId = results.googleCompObjTrim[i].bizPlacesId;
                    bObjList.bizLat = results.googleCompObjTrim[i].bizLat;
                    bObjList.bizLng = results.googleCompObjTrim[i].bizLng;

                    $scope.businessList.push(bObjList);
                    $scope.businessNameList.push(bObjList.companyname);
                }
            } else {
                $scope.resMessage = true;
            }
            var items = [];
            return $scope.businessList.map(function (item) {
                items = item
                return items;
            });
        });
    }

    $scope.onSelect = function ($item) {

        clearFields();

        var index = 0;
        var found = $scope.businessList.filter(function (biz) {
            return biz.bizPlacesId === $item.bizPlacesId
        });

        $scope.business.id = found[index].companyId;
        $scope.business.restaurantName = found[index].companyname;
        $scope.bizPlacesId = found[index].bizPlacesId;
        $scope.bizLat = found[index].bizLat;
        $scope.bizLng = found[index].bizLng;

        UserService.bizGoogleSearchDetail($scope.bizPlacesId)
            .then(function (result) {
                var addressDetail = result.googleBusinessObj;
                $scope.business.address = addressDetail.street;
                $scope.business.city = addressDetail.city;
                $scope.business.state = addressDetail.state;
                $scope.business.zipcode = addressDetail.zip;
            });

        $scope.hasSelectedBiz = true;
    };

    // ==============================
    // Check if restaurant is unique
    // ==============================

    $scope.nameLoading = false;
    $scope.nameAccepted = false;
    $scope.nameFailed = false;



    $scope.checkRestaurant = function (urlName) {

        getRandomValues('restaurant');
        $scope.nameLoading = true;

        if (urlName !== undefined && urlName !== null) {
            UserService.restaurantCheck(urlName).then(function (result) {
                getRandomValues('restaurant');
                $scope.nameLoading = false;
                if (result == null) {
                    $scope.nameAccepted = true;
                } else {
                    $scope.nameFailed = true;
                }

            });

        } else {
            $scope.nameLoading = false;
        }
    }



    $scope.resetRestaurant = function () {
        $scope.nameLoading = false;
        $scope.nameAccepted = false;
        $scope.nameFailed = false;
    }

    $scope.removeSpace = function () {
        $scope.business.webaddress = $scope.business.webaddress.replace(/\s/g, '');
    }

    $scope.emailLoading = false;
    $scope.businessEmailAccepted = false;
    $scope.emailFailed = false;

    /*$scope.checkEmail = function (emailAddress) {

        getRandomValues('email');
        $scope.emailLoading = true;

        if (emailAddress !== undefined && emailAddress !== null) {

            UserService.emailCheck(emailAddress, false).then(function (response) {
                getRandomValues('email');
                $scope.emailLoading = false;
                if (response.valid) {
                    $scope.businessEmailAccepted = true;
                } else {
                    $scope.emailFailed = true;
                }

            });
        } else {
            $scope.emailLoading = false;
            $scope.emailFailed = true;
        }
    }*/

    $scope.resetEmail = function () {
        $scope.emailLoading = false;
        $scope.businessEmailAccepted = false;
        $scope.emailFailed = false;
    }

    // ==============================
    // Check if phone number is unique
    // ==============================
    $scope.phoneNumberDuplicate = false;
    $scope.phoneNumberLoading = false;
    $scope.phoneNumberAccepted = false;
    $scope.phoneNumberFailed = false;

    $scope.checkPhoneNumber = function (phoneNumber, PLength) {

        getRandomValues('phoneNumber');
        $scope.phoneNumberLoading = true;

        //        if (PLength != undefined && PLength != 0) {
        //            getRandomValues('phoneNumber');
        /*UserService.phoneCheck(phoneNumber, false).then(function (response) {
            getRandomValues('phoneNumber');
            $scope.phoneNumberLoading = false;
            if (response.valid) {
                $scope.phoneNumberAccepted = true;
            } else {
                $scope.phoneNumberDuplicate = true;
            }

        });        } else*/

        if (phoneNumber == undefined && PLength != 0) { //partial phone number - failed case
            $scope.phoneNumberLoading = false;
            $scope.phoneNumberFailed = true;
        } else {
            $scope.phoneNumberLoading = false;
            $scope.phoneNumberFailed = false;
        }
    }

    $scope.resetPhoneNumber = function () {
        $scope.phoneNumberLoading = false;
        $scope.phoneNumberAccepted = false;
        $scope.phoneNumberFailed = false;
        $scope.phoneNumberDuplicate = false;
    }

    $scope.addBusiness = function (business, addMoreBusiness, isValid) {
        $scope.spinner = true;

        if (isValid && !$scope.phoneNumberFailed && $scope.hasSelectedBiz) {

            $scope.addBussinessFormValid = false;

            var bizType = 'Gas station';
            var bizSubtype = '';
            for (obj in $scope.restype) {
                if ($scope.restype[obj].id == business.restype) {
                    bizType = $scope.restype[obj].refCode;
                    break;
                }
            }

            for (obj in $scope.foodtype) {
                if ($scope.foodtype[obj].id == business.foodtype) {
                    bizSubtype = $scope.foodtype[obj].refCode;
                    break;
                }
            }

            var businessObj = {
                id: $scope.business.id,
                contactId: $rootScope.userData.contact == null ? $rootScope.userData.id : $rootScope.userData.contact.id,
                name: business.restaurantName,
                email: business.emailAddress,
                phoneNumber: business.phoneNumber,
                bizType: bizType,
                bizSubtype: bizSubtype,
                priceLevel: business.pricelevel,
                streetAddress: business.address,
                city: business.city,
                state: business.state,
                zip: business.zipcode,
                token: $rootScope.userData.contact == null ? $rootScope.userData.token : $rootScope.userData.contact.token,
                bizPlacesId: $scope.bizPlacesId,
                bizLat: $scope.bizLat,
                bizLng: $scope.bizLng,
                fromGooglePlaces: false
            }

            UserService.addBusiness(businessObj).then(function (result) {
                $scope.errorMessage = '';
                if (result.status == 200) {
                    if (addMoreBusiness) { //clears the fields and stay on the form
                        if (result.status == 200) {
                            $scope.business = {
                                name: null,
                                email: null,
                                phoneNumber: null,
                                bizType: null,
                                bizSubtype: null,
                                priceLevel: null,
                                urlName: null,
                                streetAddress: null,
                                city: null,
                                state: null,
                                zip: null
                            }

                            var current = $state.current;
                            var params = angular.copy($stateParams);
                            $state.transitionTo(current, params, {
                                reload: true,
                                inherit: true,
                                notify: true
                            });
                        }
                    } else {
                        $window.location.href = "/home/review/list";
                    }
                } else {
                    $scope.errorMessage = result.data.message;
                    $scope.spinner = false;
                }
            })
        } else {
            $scope.addBussinessFormValid = true;
            $scope.spinner = false;
        }
    };

    $scope.$on('$locationChangeStart', function (event, next, current) {
        var path = $location.path();
        $rootScope.addAnotherBiz = $location.$$search.addAnotherBiz == 'true' ? true : false;

        if (next == current) {
            $window.location.href = 'help/signup/biz/contact#/branch'
        } else if (next != current) {
            if (path == "" && path != '/branch')
                $window.location.href = 'help/signup/biz/contact';
        }
    });


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
                (document.getElementById('street_address_long')), options);


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
                    addressType = "street_address_long";
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
                $('input.updatefield').trigger('change');
            });
        }, 250);
    }

    $scope.backtoDashboard = function () {
        $window.location.href = '/home/review/list';
    }

}]);
