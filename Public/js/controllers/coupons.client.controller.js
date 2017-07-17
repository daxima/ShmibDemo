app.controller('couponsCtrl', ['$scope', '$state','$cookies', '$rootScope', function($scope, $state, $cookies, $rootScope){  
  
	$rootScope.uid=user.id;	
	$scope.Coupons=[];	 
	var today=new Date();   
	for(var i=0; i < coupons.length; i++){
		$scope.pushRank={};
		var couponObj={
			id:null,
			companyId:null,
			contactId:null,
            couponHeader: null			 
		};
		couponObj.id=coupons[i].id;
		couponObj.companyId=coupons[i].companyId;
		couponObj.contactId=coupons[i].contactId;		
        couponObj.couponHeader=coupons[i].couponHeader;		        
        couponObj.couponShortDesc=coupons[i].couponShortDesc;	
        couponObj.couponLongDesc=coupons[i].couponLongDesc;	
        couponObj.validityDays=coupons[i].validityDays;	
        couponObj.couponCode=coupons[i].couponCode;	
        couponObj.isActive=coupons[i].isActive;	
		        
		$scope.Coupons.push(couponObj);
		
	}	 
}]);