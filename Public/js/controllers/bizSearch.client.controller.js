app.controller('bizSearchCtrl', ['$scope', '$uibModal', '$window', '$state', 'UserService', '$timeout', '$location', 'bizGoogleSelection', 'deviceDetector', function ($scope, $uibModal, $window, $state, UserService, $timeout, $location, bizGoogleSelection, deviceDetector) {
    $scope.model = {
        bizSearch: ''
    };
    var businessListTh = [];
    $scope.businessList = [];
    $scope.user = user;
    $scope.resMessage = false;
    $scope.isSuccess = false;
    $scope.Name = '';
    $scope.currentLng = 0.0;
    $scope.currentLat = 0.0;
    $scope.geoLng = 0.0;
    $scope.geoLat = 0.0;
    $scope.geoPermission = false;
    $scope.showLoader = false;
    $scope.btnClearText = false;
    $scope.isDesktop = deviceDetector.isDesktop();
    $scope.device = deviceDetector.device;
    $scope.city = '';


    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
                //alert('Geolocation is supported! before $aply');
                $scope.$apply(function () {
                    $scope.position = position;
                    $scope.geoPermission = true;
                    $scope.geoLng = position.coords.longitude;
                    $scope.geoLat = position.coords.latitude;
                    $scope.currentLng = $scope.geoLng;
                    $scope.currentLat = $scope.geoLat
                        // Load default company on page load
                        //alert('Geolocation is supported! '+ $scope.geoLng+' '+ $scope.geoLat);
                    $scope.GoogleSearch('restaurant', $scope.geoLng, $scope.geoLat);

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
                $scope.businessList = [];
                $scope.resMessage = true;
            }

            var items = [];
            return $scope.cityList.map(function (item) {
                items = item
                return items;
            });
        });
    }

    $scope.onSelectCity = function ($item) {

        var tmpBizSearch = $scope.model.bizSearch;

        $scope.geoLat = $item.cityLat;
        $scope.geoLng = $item.cityLng;
        $scope.hasSelectedCity = true;
        //console.log('city seelcted tmpBizSearch: '+ tmpBizSearch);
        if (tmpBizSearch) {
            $scope.GoogleSearch(tmpBizSearch);
        } else {
            $scope.GoogleSearch('restaurant');
        }
    };

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
    
    if (user != null || user != undefined) {
        if (user.firstName != null || user.firstName != undefined)
            $scope.Name = user.firstName + ' ' + user.lastName;
        else
            $scope.Name = user.userName;
    }

    $scope.Search = function (text) {
        $scope.businessList = [];
        var searchText = '';
        $scope.showLoader = true;
        if (text != '' || text != "") {
            if (text.companyname != undefined)
                searchText = text.companyname;
            else
                searchText = text;

            UserService.bizSearch(searchText).then(function (results) {

                $scope.resMessage = false;
                $scope.showLoader = false;
                $scope.businessList = [];
                if (results.company.length > 0) {

                    for (var i = 0; i < results.company.length; i++) {
                        var formatted_address = "";

                        var bObjList = {
                            companyId: null,
                            companyname: null,
                            urlname: null,
                            address: null,
                            priceLevel: null,
                            averageRating: 0,
                            overallRating: [],
                            bizPlacesId: null
                        }

                        if (results.company[i].city != null) {
                            formatted_address = results.company[i].streetAddress + ", " + results.company[i].city + ", " + results.company[i].state + ", " + results.company[i].zip;
                        } else {
                            formatted_address = results.company[i].streetAddress;
                        }

                        bObjList.companyId = results.company[i].id;
                        bObjList.companyname = results.company[i].name;
                        bObjList.urlname = results.company[i].urlName;
                        bObjList.address = formatted_address;
                        bObjList.priceLevel = results.company[i].priceLevel;
                        bObjList.averageRating = results.company[i].averageRating;
                        bObjList.bizPlacesId = results.company[i].bizPlacesId;

                        getStar(bObjList.averageRating);
                        bObjList.overallRating = $scope.pushRank;
                        $scope.businessList.push(bObjList);
                    }
                } else {
                    $scope.resMessage = true;
                }
            });
        } else {
            $scope.resMessage = true;
        }
    }
    $scope.GoogleSearch = function (text) {
        $scope.businessList = [];
        var searchText = '';
        if (text != '' || text != "") {
            if (text.companyname != undefined)
                searchText = text.companyname;
            else
                searchText = text;
            //console.log('$scope.geoPermission' + $scope.geoPermission);
            if ($scope.geoPermission === false) {
                //$scope.Search(searchText);
            } else {

                //console.log('im hit 3')
                //console.log('geoLng ' + $scope.geoLng)
                //console.log('searchText ' + searchText + ' - ' + $scope.geoLat + ' : ' + $scope.geoLng)

                //UserService.bizSearch(searchText).then(function (results) {
                //UserService.bizGoogleSearch(searchText, "37.87", "-122.18").then(function (results) {
                UserService.bizGoogleSearch(searchText, $scope.geoLat, $scope.geoLng).then(function (results) {
                    $scope.resMessage = false;
                    $scope.businessList = [];
                    if (results.googleCompObjTrim.length > 0) {

                        for (var i = 0; i < results.googleCompObjTrim.length; i++) {
                            var bObjList = {
                                companyId: null,
                                companyname: null,
                                urlname: null,
                                address: null,
                                priceLevel: null,
                                averageRating: 0,
                                overallRating: [],
                                bizPlacesId: null
                            }
                            bObjList.companyId = results.googleCompObjTrim[i].id;
                            bObjList.companyname = results.googleCompObjTrim[i].name;
                            bObjList.urlname = results.googleCompObjTrim[i].urlName;

                            //                            if (results.googleCompObjTrim[i].id === 0) {
                            //                                bObjList.address = 'From Google: ' + results.googleCompObjTrim[i].fullStreetAddress;
                            //                            } else {
                            bObjList.address = results.googleCompObjTrim[i].fullStreetAddress;
                            //                            }
                            bObjList.priceLevel = results.googleCompObjTrim[i].priceLevel;
                            bObjList.averageRating = results.googleCompObjTrim[i].averageRating;
                            bObjList.bizPlacesId = results.googleCompObjTrim[i].bizPlacesId;

                            getStar(bObjList.averageRating);
                            bObjList.overallRating = $scope.pushRank;
                            $scope.businessList.push(bObjList);
                        }
                    } else {
                        $scope.resMessage = true;
                    }
                });
            }
        } else {
            $scope.resMessage = true;
        }
    }



    // Load default company on page load
    //$scope.Search('restaurant');

    $scope.selectbusinessList = function (listTh) {
        $scope.businessList = [];
        if (listTh != null) {
            $scope.businessList.push(listTh);
            $scope.resMessage = false;
        }
    }

    function getStar(number) {
        var totalnumber = Math.round(number);
        $scope.pushRank = {};
        switch (totalnumber) {
            case 1:
                $scope.pushRank = [{
                    id: 1,
                    star: 'glyphicon glyphicon-star'
                }, {
                    id: 2,
                    star: 'glyphicon glyphicon-star opacity_half'
                }, {
                    id: 3,
                    star: 'glyphicon glyphicon-star opacity_half'
                }, {
                    id: 4,
                    star: 'glyphicon glyphicon-star opacity_half'
                }, {
                    id: 5,
                    star: 'glyphicon glyphicon-star opacity_half'
                }];
                break;
            case 2:
                $scope.pushRank = [{
                    id: 1,
                    star: 'glyphicon glyphicon-star'
                }, {
                    id: 2,
                    star: 'glyphicon glyphicon-star'
                }, {
                    id: 3,
                    star: 'glyphicon glyphicon-star opacity_half'
                }, {
                    id: 4,
                    star: 'glyphicon glyphicon-star opacity_half'
                }, {
                    id: 5,
                    star: 'glyphicon glyphicon-star opacity_half'
                }];
                break;
            case 3:
                $scope.pushRank = [{
                    id: 1,
                    star: 'glyphicon glyphicon-star'
                }, {
                    id: 2,
                    star: 'glyphicon glyphicon-star'
                }, {
                    id: 3,
                    star: 'glyphicon glyphicon-star'
                }, {
                    id: 4,
                    star: 'glyphicon glyphicon-star opacity_half'
                }, {
                    id: 5,
                    star: 'glyphicon glyphicon-star opacity_half'
                }];
                break;
            case 4:
                $scope.pushRank = [{
                    id: 1,
                    star: 'glyphicon glyphicon-star'
                }, {
                    id: 2,
                    star: 'glyphicon glyphicon-star'
                }, {
                    id: 3,
                    star: 'glyphicon glyphicon-star'
                }, {
                    id: 4,
                    star: 'glyphicon glyphicon-star'
                }, {
                    id: 5,
                    star: 'glyphicon glyphicon-star opacity_half'
                }];
                break;
            case 5:
                $scope.pushRank = [{
                    id: 1,
                    star: 'glyphicon glyphicon-star'
                }, {
                    id: 2,
                    star: 'glyphicon glyphicon-star'
                }, {
                    id: 3,
                    star: 'glyphicon glyphicon-star'
                }, {
                    id: 4,
                    star: 'glyphicon glyphicon-star'
                }, {
                    id: 5,
                    star: 'glyphicon glyphicon-star'
                }];
                break;
            default:
                $scope.pushRank = [{
                    id: 1,
                    star: 'glyphicon glyphicon-star opacity_half'
                }, {
                    id: 2,
                    star: 'glyphicon glyphicon-star opacity_half'
                }, {
                    id: 3,
                    star: 'glyphicon glyphicon-star opacity_half'
                }, {
                    id: 4,
                    star: 'glyphicon glyphicon-star opacity_half'
                }, {
                    id: 5,
                    star: 'glyphicon glyphicon-star opacity_half'
                }];
                break;
        }
    }

    $scope.getMyProfile = function () {
        $window.location.href = '/me/profile';
    }

    $scope.getBizSearchPage = function () {
        $window.location.href = '/me/biz/search';
    }

    $scope.getUserReviewPage = function (item) {
        //if item.biz_id is null then
        // create entries into angular factory

        if (item.companyId === 0 || item.companyId === null) {
            UserService.bizGoogleSearchDetail(item.bizPlacesId).then(function (result) {
                if (result.googleBusinessObj) {
                    UserService.addGoogleBusiness(result.googleBusinessObj).then(function (result) {
                        //console.log('addGoogleBusiness');
                        if (result) {
                            //$window.location.href = '/biz/new/' + item.bizPlacesId + '/review';
                            //check placeid exists or not
                            $window.location.href = '/biz/' + result.company.urlName + '/review';
                        }
                    });
                }
            });
            // var formattedNameURL = item.companyname.replace(/[^A-Z0-9]+/ig, "")+"_" + item.address.replace(/[^A-Z0-9]+/ig, "");
            //
            // bizGoogleSelection.set('bizSearch.Biz:companyname', item.companyname);
            // //bizGoogleSelection.set('bizSearch.Biz:urlname', item.urlname);
            // //set the URL name as formattedNameURL
            // bizGoogleSelection.set('bizSearch.Biz:urlname', formattedNameURL);
            // bizGoogleSelection.set('bizSearch.Biz:address', item.address);
            // bizGoogleSelection.set('bizSearch.Biz:placeid', item.bizPlacesId);
            // // bizGoogleSelection.set('bizSearch.Biz:bizLat', item.bizLat);
            // // bizGoogleSelection.set('bizSearch.Biz:bizLng', item.bizLng);
            //
            // var companyname = bizGoogleSelection.get('bizSearch.Biz:companyname');
            // var urlname = bizGoogleSelection.get('bizSearch.Biz:urlname');
            // var address = bizGoogleSelection.get('bizSearch.Biz:address');
            // var bizPlacesId = bizGoogleSelection.get('bizSearch.Biz:placeid');
            // // var bizLat = bizGoogleSelection.get('bizSearch.Biz:bizLat');
            // // var bizLng = bizGoogleSelection.get('bizSearch.Biz:bizLng');

        } else {
            $window.location.href = '/biz/' + item.urlname + '/review';
        }
    }

    $scope.getReviewPage = function () {
        $window.location.href = '/me/review/list';
    }

    $scope.getLoginPage = function () {
        $window.location.href = '/auth/login';
    }

    $scope.cancel = function () {
        $scope.businessList = [];
        $scope.model.bizSearch = '';
        $scope.resMessage = false;
    }

    $scope.clearSearchText = function () {
        $scope.model.bizSearch = '';
        $scope.resMessage = false;
    }

    $scope.clearCityText = function () {

        //console.log('bizsearch = ' + $('[name="bizsearch"]').val())

        $('[name="city"]').val('');
        $scope.city = '';
        $scope.geoLng = $scope.currentLng;
        $scope.geoLat = $scope.currentLat;

        var temp_bizSearch = $scope.model.bizSearch;

        if (temp_bizSearch) {
            $scope.GoogleSearch(temp_bizSearch);
        } else {
            $scope.GoogleSearch('restaurant');
        }
        //$scope.GoogleSearch($('[name="bizsearch"]').val());

    }

    $scope.$watch('model.bizSearch', function () {
        console.log($scope.model.bizSearch);
        if ($scope.model.bizSearch != "") {
            $scope.btnClearText = true;
        } else {
            $scope.btnClearText = false;
        }
    });
}]);
