app.controller('reviewsCtrl', ['$scope', '$state', '$cookies', '$rootScope', '$window', 'UserService', function ($scope, $state, $cookies, $rootScope, $window, UserService) {


    // Only verified user can access this page
    UserService.getUserProfile().then(function (result) {
        if (result.status == 400) {
            $window.location.href = '/auth/login/biz';
        }
    });

    var selectedCompany = company[0];

    $scope.companyName = selectedCompany.name;
    $scope.companyAddress = selectedCompany.streetAddress + ', ' + selectedCompany.city + ', ' + selectedCompany.state + ', ' + selectedCompany.zip

    var host = $window.location.host;
    var restraUrl = selectedCompany.urlName;
    $scope.reviewLink = siteProtocol + host + '/biz/' + restraUrl;

    $rootScope.uid = user.id;
    $rootScope.contactType = user.contactType;
    $scope.pushRank = {};
    $scope.isDayShow = false;
    $scope.showLoader = true;
    var today = new Date();
    var startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29);
    var endDate = new Date(today);
    var userID = null;
    var id = selectedCompany.id;
    var reviews = [];
    $scope.isUserSelectedMonth = false;

    $scope.selectedItem = 'Select Month';
    var monthNames = ["January", "February", "March",
	 "April", "May", "June",
  	 "July", "August", "September",
	 "October", "November", "December"
	];
    $scope.monthRange = [];
    var mm = today.getMonth();
    MonthRanges(mm);

    function MonthRanges(mm) {
        $scope.monthRange = [];

        var tempObj = {
            month: null,
            year: null,
            text: 'All Shmibs'
        };
        $scope.monthRange.push(tempObj);
        if (mm < 11) {
            for (var pm = mm + 1; pm <= 11; pm++) {
                tempObj = {
                    month: null,
                    year: null,
                    text: null
                };
                tempObj.year = today.getFullYear() - 1;
                tempObj.month = pm;
                tempObj.text = monthNames[pm] + ' ' + tempObj.year;
                $scope.monthRange.push(tempObj);
            }
        }
        for (var cm = 0; cm <= mm; cm++) {
            tempObj = {
                month: null,
                year: null,
                text: null
            };
            tempObj.year = today.getFullYear();
            tempObj.month = cm;
            tempObj.text = monthNames[cm] + ' ' + tempObj.year;
            $scope.monthRange.push(tempObj);
        }
    }

    $scope.dropboxitemselected = function (item) {
        startDate = new Date(item.year, item.month, 1);
        endDate = item.month == null ? new Date() : new Date(item.year, item.month + 1, 0);

        getReviews(userID, id, startDate, endDate);

        $scope.selectedItem = item.text;
        $scope.isUserSelectedMonth = true;
    }

    function getReviews(userID, id, startDate, endDate) {
        UserService.getReviews(userID, id, startDate, endDate).then(function (result) {
            $scope.Reviews = [];
            if (result.reviews.length > 0) {
                for (var i = 0; i < result.reviews.length; i++) {
                    $scope.pushRank = {};
                    var reviewObj = {
                        id: null,
                        companyId: null,
                        contactId: null,
                        review: [],
                        timeElapsed: null,
                        isDay: false,
                        rating: 0,
                        shmibberFirstName: 'Anonymous',
                        shmibberLastName: '',
                        totalShmibCount: 'N/A'
                    };
                    reviewObj.id = result.reviews[i].id;
                    reviewObj.companyId = result.reviews[i].companyId;
                    reviewObj.contactId = result.reviews[i].contactId;
                    result.reviews[i].scoreFood = result.reviews[i].scoreFood == null ? 0 : result.reviews[i].scoreFood;
                    result.reviews[i].scoreService = result.reviews[i].scoreService == null ? 0 : result.reviews[i].scoreService;
                    result.reviews[i].scoreClean = result.reviews[i].scoreClean == null ? 0 : result.reviews[i].scoreClean;
                    var avgReview = parseFloat((parseInt(result.reviews[i].scoreFood) + parseInt(result.reviews[i].scoreService) + parseInt(result.reviews[i].scoreClean)) / 3);
                    var totalnumber = Math.round(avgReview);
                    reviewObj.rating = totalnumber;
                    getStar(totalnumber);
                    reviewObj.review = $scope.pushRank;
                    reviewObj.timeElapsed = daysBetween(new Date(result.reviews[i].createdAt), today);

                    var shmibber = result.reviews[i].contact;
                    if (shmibber) {
                        reviewObj.shmibberFirstName = shmibber.firstName;
                        reviewObj.shmibberLastName = shmibber.lastName;
                        reviewObj.totalShmibCount = shmibber.reviewCount;
                    }

                    if ($scope.isDayShow)
                        reviewObj.isDay = true;
                    $scope.Reviews.push(reviewObj);
                    $scope.showLoader = false;
                }
                updatePaging($scope.Reviews.length);
            } else {
                $scope.showLoader = false;
            }
        });
    }

    //call method on page load
    getReviews(userID, id, startDate, endDate);

    function updatePaging(totalItems) {
        $scope.maxSize = 5;
        $scope.itemsPerPage = 10;
        $scope.CurrentPage = 1;
        $scope.TotalItems = totalItems;
    }


    $scope.orderByField = 'timeElapsed';
    $scope.reverseSort = false;


    function getStar(number) {
        $scope.pushRank = {};
        switch (number) {
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

    function daysBetween(date1, date2) {
        //Get 1 day in milliseconds
        var one_day = 1000 * 60 * 60 * 24;

        // Convert both dates to milliseconds
        var date1_ms = date1.getTime();
        var date2_ms = date2.getTime();

        // Calculate the difference in milliseconds
        var difference_ms = date2_ms - date1_ms;
        //take out milliseconds
        difference_ms = difference_ms / 1000;
        var seconds = Math.floor(difference_ms % 60);
        difference_ms = difference_ms / 60;
        var minutes = Math.floor(difference_ms % 60);
        difference_ms = difference_ms / 60;
        var hours = Math.floor(difference_ms % 24);
        var days = Math.floor(difference_ms / 24);
        $scope.isDayShow = true;
        return date1;
    }
}]);
