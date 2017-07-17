app.controller('couponDetailsCtrl', ['$scope', '$state', '$cookies', '$rootScope', '$stateParams', 'UserService', function ($scope, $state, $cookies, $rootScope, $stateParams, UserService) {
 
    $scope.id = $stateParams.id;
    $scope.today = new Date();
    $scope.loginuser = user.id;

    $scope.Coupon = [];

    // if no scope.id, then its a Add coupon else its and update coupon
    if (!(typeof $scope.id === 'undefined' || $scope.id === null)) {
        
     UserService.getCouponById($scope.id).then(function (results) {
         $scope.Coupon = results.Coupon;
     });
 }
  
    $scope.AddCoupon = function (isValidForm) {
        $scope.validForm = true;
        if (isValidForm) { 
            
            var couponType = '';
            couponType = $scope.Coupon.couponType;
 
            $scope.Coupon.isActive = $scope.Coupon.isActive === undefined ? false : true;

            var couponObj = {              
                couponType: couponType,
                couponHeader: $scope.Coupon.couponHeader,
                couponShortDesc: $scope.Coupon.couponShortDesc,
                couponLongDesc: $scope.Coupon.couponLongDesc,
                validityDays: $scope.Coupon.validityDays,
                couponCode: $scope.Coupon.couponCode,
                isActive: $scope.Coupon.isActive,
                token: user.token
            };
             
            
            UserService.addCoupon(couponObj).then(function (result) {
                $scope.resMessage = true;
                if (result.status == "Coupon added successfully!") {
                    $scope.isSuccess = false;
                    $scope.resMessageContent = 'coupon created successfuly';
                }

            });
        } else {
            $scope.signupFormValid = true;
        }
    };
    
         $scope.UpdateCoupon = function (isValidForm) {
        $scope.validForm = true;
        if (isValidForm) { 
            
            var couponType = '';
            couponType = $scope.Coupon.couponType;
 

            var couponObj = {
                id: $scope.id,
                companyId: $scope.Coupon.companyId,
                couponType: couponType,
                couponHeader: $scope.Coupon.couponHeader,
                couponShortDesc: $scope.Coupon.couponShortDesc,
                couponLongDesc: $scope.Coupon.couponLongDesc,
                validityDays: $scope.Coupon.validityDays,
                timesUsed: $scope.Coupon.timesUsed,
                couponCode: $scope.Coupon.couponCode,
                isActive: $scope.Coupon.isActive,
                contactId: $scope.loginuser,
                token: user.token
            };
            
            UserService.updateCoupon(couponObj).then(function (result) {
                $scope.resMessage = true;
                if (result.status == "update successful!") {
                    $scope.isSuccess = false;
                    $scope.resMessageContent = 'coupon updated successfuly';
                }

            });
        } else {
            $scope.signupFormValid = true;
        }
    }; 
    
    

}]);