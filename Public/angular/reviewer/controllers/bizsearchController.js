angular.module('shmib').controller('bizsearchController', ['$scope', '$window', '$q', '$log', '$http', 'growl', function ($scope, $window, $q, $log, $http, growl) {
    
    $scope.model = {
        bizSearch: '',
        bizList: {}
    };
    
    $scope.user = '';
    
    $scope.init = function(){
        $scope.errors = [];

        $scope.model.bizSearch = 'Pizza';
        
        var reqs1 = [];
		$.merge(reqs1, $scope.getUserProfile());
        $.merge(reqs1, $scope.getBizSearch($scope.model.bizSearch));
		$q.all(reqs1)
		.finally(function () {
			if ($scope.errors.length == 0) {
				$scope.loaded = true;
			} else {
				growl.error("Error loading page data");
			}
		});

    }
    
    $scope.Search = function(text){
        var reqs1 = [];
        $.merge(reqs1, $scope.getBizSearch(text));
        
        $q.all(reqs1)
        .finally(function(){
            if ($scope.errors.length == 0) {
				$scope.loaded = true;
			} else {
				growl.error("Error loading page data");
			}
        })
    }
    
    
    /////////////////////Call APIs////////////////////
    $scope.getUserProfile = function(){
        var reqs = [];
		reqs.push($http.get("/api/user/profile")
			.success(function (result) {
				$scope.user = result;
			})
			.error(function (error) {
				$log.error('Error loading user profile.');
				$scope.errors.push(error);
			}));
		return reqs;
    }
    
    $scope.getBizSearch = function(text){
        var reqs = [];
        reqs.push($http.get("/api/business/search?searchtext=" + text)
        .success(function(result){
            $scope.model.bizList = {};
            $scope.model.bizList = result;
        })
        .error(function(error){
            $log.error('Error loading business list.');
            $scope.errors.push(error);
        }))
        
        return reqs;
    }
    /////////////////////////////////////////////////////
    
    
    $scope.getMyProfile = function () {
        $window.location.href = '/me/profile';
    }

    $scope.getBizSearchPage = function () {
        $window.location.href = '/angular/biz/search';
    }

    $scope.getUserReviewPage = function (urlName) {
        $window.location.href = '/biz/' + urlName + '/review';
    }

    $scope.getReviewPage = function () {
        $window.location.href = '/me/review/list';
    }

    $scope.getLoginPage = function () {
        $window.location.href = '/auth/login';
    }
    
    $scope.clearSearchText = function () {
        $scope.model.bizSearch = '';
    }
    
    $scope.init();

}]);


