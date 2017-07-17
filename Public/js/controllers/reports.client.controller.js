app.controller('reportsCtrl', ['$scope', '$state', '$cookies', '$rootScope', 'UserService', '$timeout', 'lodash', function ($scope, $state, $cookies, $rootScope, UserService, $timeout, lodash) {

    // Only verified user can access this page
    UserService.getUserProfile().then(function (result) {
        if (result.status == 400) {
            $window.location.href = '/auth/login/biz';
        }
    });

    $scope.bizType = bizType;
    $rootScope.CompanyId = companyId;
    $scope.foodChartexclude5star = false;
    $scope.cleanChartexclude5star = false;
    $scope.serviceChartexclude5star = false;
    $scope.selectedItem = 'Select Month';
    var firstDay = null;
    var lastDay = null;
    var firstDaypreviousMonth = null;
    var lastDaypreviousMonth = null;

    var monthNames = ["January", "February", "March",
	 "April", "May", "June",
  	 "July", "August", "September",
	 "October", "November", "December"
	];
    $scope.monthRange = [];

    var tempdate = new Date();
    var getnextday = function (dateNow) {
        tempdate = new Date(dateNow);
        return new Date(tempdate.setDate(tempdate.getDate() + 1));
    }

    var mm = tempdate.getMonth();
    $scope.currentMonth = monthNames[mm].substring(0, 3);

    $scope.currentYear = tempdate.getFullYear();
    MonthRanges(mm);

    function MonthRanges(mm) {
        $scope.monthRange = [];
        if (mm < 11) {
            for (var pm = mm + 1; pm <= 11; pm++) {
                var tempObj = {
                    month: null,
                    year: null,
                    text: null
                };
                tempObj.year = tempdate.getFullYear() - 1;
                tempObj.month = pm;
                tempObj.text = monthNames[pm] + ' ' + tempObj.year;
                $scope.monthRange.push(tempObj);
            }
        }
        for (var cm = 0; cm <= mm; cm++) {
            var tempObj = {
                month: null,
                year: null,
                text: null
            };
            tempObj.year = tempdate.getFullYear();
            tempObj.month = cm;
            tempObj.text = monthNames[cm] + ' ' + tempObj.year;
            $scope.monthRange.push(tempObj);
        }
    }

    var formatteddate = function (datetoformat) {
        tempdate = new Date(datetoformat);
        var dd = tempdate.getDate();
        var mm = tempdate.getMonth();

        if (dd < 10) {
            dd = '0' + dd
        }
        var shortMonth = monthNames[mm];

        return dd + ' ' + shortMonth.substring(0, 3);

    }

    var getDateRange = function (startDate, endDate) {
        var index = 0;
        var dateRange = [];
        var latestDate = new Date(startDate);
        dateRange.push(formatteddate(latestDate));
        while ((formatteddate(latestDate) != formatteddate(endDate))) {
            latestDate = getnextday(new Date(latestDate));
            dateRange.push(formatteddate(latestDate));
            index++;
        }
        return dateRange;
    }

    var date = new Date();
    firstDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 29);
    lastDay = new Date(date);

    firstDaypreviousMonth = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 59);
    lastDaypreviousMonth = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 30);

    $scope.labels = getDateRange(firstDay, lastDay);

    fillGraph($rootScope.CompanyId, firstDay, lastDay, firstDaypreviousMonth, lastDaypreviousMonth);

    $scope.dropboxitemselected = function (item) {
        firstDay = new Date(item.year, item.month, 1);
        lastDay = new Date(item.year, item.month + 1, 0);
        var newDate = new Date(firstDay);
        newDate.setDate(1); // going to 1st of previous month
        newDate.setHours(-1);
        firstDaypreviousMonth = new Date(newDate.getFullYear(), newDate.getMonth());
        lastDaypreviousMonth = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0);

        $scope.currentMonth = monthNames[item.month].substring(0, 3);
        $scope.currentYear = item.year;

        $scope.labels = getDateRange(firstDay, lastDay);
        fillGraph($rootScope.CompanyId, firstDay, lastDay, firstDaypreviousMonth, lastDaypreviousMonth);

        $scope.selectedItem = item.text;
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
    $scope.getReviewScore = function () {
        $scope.foodData = [];
        $scope.serviceData = [];
        $scope.cleanData = [];

        $scope.totalFoodScore = 0;
        $scope.totalServiceScore = 0;
        $scope.totalCleanScore = 0;

        $scope.overallFoodScore = 0;
        $scope.overallServiceScore = 0;
        $scope.overallCleanScore = 0;

        var totalFoodReviewCount = 0;
        var totalServiceReviewCount = 0;
        var totalCleanReviewCount = 0;

        for (obj in $scope.labels) {
            $scope.foodScore = 0;
            $scope.serviceScore = 0;
            $scope.cleanScore = 0;

            var foodReviewCount = 0;
            var serviceReviewCount = 0;
            var cleanReviewCount = 0;

            for (var index = 0; index < $scope.currentMonthRatings.length; index++) {
                var item = $scope.currentMonthRatings[index];

                if ($scope.labels[obj] == formatteddate(item.createdAt)) {
                    item.scoreFood = item.scoreFood == null ? 0 : item.scoreFood;
                    item.scoreService = item.scoreService == null ? 0 : item.scoreService;
                    item.scoreClean = item.scoreClean == null ? 0 : item.scoreClean;

                    if ($scope.foodChartexclude5star && parseInt(item.scoreFood) == 5) {
                        $scope.foodScore += 0
                    } else {
                        $scope.foodScore += parseInt(item.scoreFood);
                        foodReviewCount++;
                    }

                    if ($scope.serviceChartexclude5star && parseInt(item.scoreService) == 5) {
                        $scope.serviceScore += 0
                    } else {
                        $scope.serviceScore += parseInt(item.scoreService);
                        serviceReviewCount++;
                    }

                    if ($scope.cleanChartexclude5star && parseInt(item.scoreClean) == 5) {
                        $scope.cleanScore += 0
                    } else {
                        $scope.cleanScore += parseInt(item.scoreClean);
                        cleanReviewCount++;
                    }
                }
                $scope.foodBarGraph = {
                    labels: $scope.labels,
                    datasets: [
                        {
                            label: "Rating",
                            fillColor: "rgba(159, 173, 174, 1)",
                            data: $scope.foodData,
            }]
                };

                $scope.serviceBarGraph = {
                    labels: $scope.labels,
                    datasets: [
                        {
                            label: "Rating",
                            fillColor: "rgba(159, 173, 174, 1)",
                            data: $scope.serviceData
            }
        ]
                };

                $scope.cleanBarGraph = {
                    labels: $scope.labels,
                    datasets: [
                        {
                            label: "Rating",
                            fillColor: "rgba(159, 173, 174, 1)",
                            data: $scope.cleanData
            }
        ]
                }
            }

            var avgScore = foodReviewCount == 0 ? 0 : Math.round($scope.foodScore / foodReviewCount);
            $scope.foodData.push(avgScore);
            $scope.totalFoodScore += $scope.foodScore;
            totalFoodReviewCount += foodReviewCount;

            avgScore = serviceReviewCount == 0 ? 0 : Math.round($scope.serviceScore / serviceReviewCount);
            $scope.serviceData.push(avgScore);
            $scope.totalServiceScore += $scope.serviceScore;
            totalServiceReviewCount += serviceReviewCount;

            avgScore = cleanReviewCount == 0 ? 0 : Math.round($scope.cleanScore / cleanReviewCount);
            $scope.cleanData.push(avgScore);
            $scope.totalCleanScore += $scope.cleanScore;
            totalCleanReviewCount += cleanReviewCount;
        }

        $scope.overallFoodScore = totalFoodReviewCount == 0 ? 0 : Math.round($scope.totalFoodScore / totalFoodReviewCount);
        getStar($scope.overallFoodScore);
        $scope.foodRating = $scope.pushRank;

        $scope.overallServiceScore = totalServiceReviewCount == 0 ? 0 : Math.round($scope.totalServiceScore / totalServiceReviewCount);
        getStar($scope.overallServiceScore);
        $scope.serviceRating = $scope.pushRank;

        $scope.overallCleanScore = totalCleanReviewCount == 0 ? 0 : Math.round($scope.totalCleanScore / totalCleanReviewCount);
        getStar($scope.overallCleanScore);
        $scope.cleanRating = $scope.pushRank;
    }

    var notFiveStarRating = function () {
        var excludefiveStarRatingFood = lodash.countBy($scope.currentMonthRatings, function (o) {
            return parseInt(o.scoreFood) != 5;
        }).true;
        var excludefiveStarRatingService = lodash.countBy($scope.currentMonthRatings, function (o) {
            return parseInt(o.scoreService) != 5;
        }).true;
        var excludefiveStarRatingClean = lodash.countBy($scope.currentMonthRatings, function (o) {
            return parseInt(o.scoreClean) != 5;
        }).true;

        excludefiveStarRatingFood = excludefiveStarRatingFood == undefined ? 0 : excludefiveStarRatingFood;
        excludefiveStarRatingService = excludefiveStarRatingService == undefined ? 0 : excludefiveStarRatingService;
        excludefiveStarRatingClean = excludefiveStarRatingClean == undefined ? 0 : excludefiveStarRatingClean;

        var ratingNotFiveStar = excludefiveStarRatingFood + excludefiveStarRatingService + excludefiveStarRatingClean;

        var totalRatings = $scope.currentMonthRatings.length * 3; //total records * type of ratings
        $scope.ratingPercentNotFive = $scope.currentMonthRatings.length == 0 ? (0).toFixed(2) : ((ratingNotFiveStar / totalRatings) * 100).toFixed(2);

        var ratingTypeObj = {
            'food': excludefiveStarRatingFood,
            'service': excludefiveStarRatingService,
            'clean': excludefiveStarRatingClean
        };

        var ratingType = lodash.chain(ratingTypeObj).keys().sort().first().value();

        switch (ratingType) {
            case 'food':
                $scope.ratingType = 'first question';
                break;
            case 'service':
                $scope.ratingType = 'second question';
                break;
            case 'clean':
                $scope.ratingType = 'third question';
                break;
        }

    }



    //get months total rating percent
    var getRatingPercent = function (scoreObj) {
        var SFOOD = lodash.filter(scoreObj, function (item) {
            return item.scoreFood != null
        });
        var SSERVICE = lodash.filter(scoreObj, function (item) {
            return item.scoreService != null
        });
        var SCLEAN = lodash.filter(scoreObj, function (item) {
            return item.scoreClean != null
        });

        var scoreFood = lodash.sumBy(SFOOD, function (o) {
            return parseInt(o.scoreFood);
        });

        var scoreService = lodash.sumBy(SSERVICE, function (o) {
            return parseInt(o.scoreService);
        });

        var scoreClean = lodash.sumBy(SCLEAN, function (o) {
            return parseInt(o.scoreClean);
        });

        return monthsRating = scoreObj.length == 0 ? 0 : (((scoreFood + scoreService + scoreClean) / (scoreObj.length * 5 * 3)) * 100); //ratings received * rating scale * rating types 
    }

    function fillGraph(CompanyId, firstDay, lastDay, firstDaypreviousMonth, lastDaypreviousMonth) {

        UserService.getCurrentMonthReviews(CompanyId, firstDay, lastDay).then(function (result) {
            $scope.currentMonthRatings = result.review;
            $scope.currentMonthRatingPercent = getRatingPercent($scope.currentMonthRatings);
            notFiveStarRating();
            setCompanyQuestions(result.customLabel);
        }).then(function () {
            $scope.getReviewScore();
        }).then(function () {

            $scope.foodBarGraph = {
                labels: $scope.labels,
                datasets: [
                    {
                        label: "Rating",
                        fillColor: "rgba(159, 173, 174, 1)",
                        data: $scope.foodData,
            	}]
            };

            $scope.serviceBarGraph = {
                labels: $scope.labels,
                datasets: [
                    {
                        label: "Rating",
                        fillColor: "rgba(159, 173, 174, 1)",
                        data: $scope.serviceData
            	}
        	]
            };

            $scope.cleanBarGraph = {
                labels: $scope.labels,
                datasets: [
                    {
                        label: "Rating",
                        fillColor: "rgba(159, 173, 174, 1)",
                        data: $scope.cleanData
            	}
        	]
            }
        }).then(function () {

            UserService.getCurrentMonthReviews(CompanyId, firstDaypreviousMonth, lastDaypreviousMonth).then(function (result) {
                $scope.previousMonthRatings = result.review;
                var previousMonthRatingPercent = getRatingPercent($scope.previousMonthRatings);
                $scope.ratingVariationpercent = ($scope.currentMonthRatingPercent - previousMonthRatingPercent).toFixed(2);

            });
        })
    }

    var setCompanyQuestions = function (customQuestions) {

        $scope.foodQuestion = 'Value?';
        $scope.serviceQuestion = 'Service?';
        $scope.cleanQuestion = 'Overall Experience?';

        $scope.isFoodQuesCustom = false;
        $scope.isServiceQuesCustom = false;
        $scope.isCleanQuesCustom = false;

        if (customQuestions != null) {
            for (var i = 0; i < customQuestions.length; i++) {

                var id = customQuestions[i].Q_id;
                var question = customQuestions[i].Q_text;

                if (question != null && question != "") {
                    switch (id) {
                        case "1":
                            $scope.foodQuestion = question;
                            $scope.isFoodQuesCustom = true;
                            break;
                        case "2":
                            $scope.serviceQuestion = question;
                            $scope.isServiceQuesCustom = true;
                            break;
                        case "3":
                            $scope.cleanQuestion = question;
                            $scope.isCleanQuesCustom = true;
                    }
                }
                //                if (id == "1" && (question != "" || question != null)) {
                //                    $scope.foodQuestion = question;
                //                    $scope.isFoodQuesCustom = true;
                //                } else if (id == "2" && question != "") {
                //                    $scope.serviceQuestion = question;
                //                    $scope.isServiceQuesCustom = true;
                //                } else if (id == "3" && question != "") {
                //                    $scope.cleanQuestion = question;
                //                    $scope.isCleanQuesCustom = true;
                //                }
            }
        }
    }

    $scope.barChartOptions = {
        scaleLabel: "<%=value%>",
        responsive: true,
        maintainAspectRatio: false,
        scaleShowGridLines: false,
        barShowStroke: false,
        scaleShowHorizontalLines: true,
        scaleFontColor: "#fff",
        scaleShowVerticalLines: true,
        scales: {
            yAxes: [{
                display: true,
                ticks: {
                    beginAtZero: true,
                    steps: 5,
                    stepValue: 1,
                    max: 5
                }
            }]
        },
    };

}]);
