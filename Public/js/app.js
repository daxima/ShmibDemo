var app = angular.module('shmib', ['ngRoute', 'ui.router', 'ngAnimate', 'ngCookies', 'ui.bootstrap', 'tc.chartjs', 'ui.mask', 'ngAnimate', 'ngLodash', 'ngFileUpload', 'ngAutocomplete', 'ng.deviceDetector']);


app.config(function ($locationProvider) {
    /*$locationProvider.html5Mode({
      enabled: true,
      requireBase: false
    });*/
});



app.run(["$rootScope", "$state", "$stateParams", function ($rootScope, $state, $stateParams) {
        $rootScope.$state = $state;
        return $rootScope.$stateParams = $stateParams;
    }
]);

app.directive('validNumber', function () {
    return {
        require: '?ngModel',
        link: function (scope, element, attrs, ngModelCtrl) {
            if (!ngModelCtrl) {
                return;
            }

            ngModelCtrl.$parsers.push(function (val) {
                if (angular.isUndefined(val)) {
                    var val = '';
                }



                var clean = val.replace(/[^0-9]/g, '');
                /* var clean = val.replace(/[^-0-9\.]/g, '');*/
                var negativeCheck = clean.split('-');
                var decimalCheck = clean.split('.');
                if (!angular.isUndefined(negativeCheck[1])) {
                    negativeCheck[1] = negativeCheck[1].slice(0, negativeCheck[1].length);
                    clean = negativeCheck[0] + '-' + negativeCheck[1];
                    if (negativeCheck[0].length > 0) {
                        clean = negativeCheck[0];
                    }

                }

                if (!angular.isUndefined(decimalCheck[1])) {
                    decimalCheck[1] = decimalCheck[1].slice(0, 2);
                    clean = decimalCheck[0] + '.' + decimalCheck[1];
                }

                if (val !== clean) {
                    ngModelCtrl.$setViewValue(clean);
                    ngModelCtrl.$render();
                }
                return clean;
            });

            element.bind('keypress', function (event) {
                if (event.keyCode === 32) {
                    event.preventDefault();
                }
            });
        }
    };
})

app.directive('focusMe', function ($timeout, $parse) {
    return {
        link: function (scope, element, attrs) {
            var model = $parse(attrs.focusMe);
            scope.$watch(model, function (value) {
                if (value === true) {
                    $timeout(function () {
                        element.focus();
                    });
                }
            });
            element.bind('blur', function () {
                scope.$apply(model.assign(scope, false));
            })
        }
    };
});

app.directive('passwordConfirm', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        scope: {
            matchTarget: '=',
        },
        require: 'ngModel',
        link: function link(scope, elem, attrs, ctrl) {
            var validator = function (value) {
                ctrl.$setValidity('match', value === scope.matchTarget);
                return value;
            }

            ctrl.$parsers.unshift(validator);
            ctrl.$formatters.push(validator);

            // This is to force validator when the original password gets changed
            scope.$watch('matchTarget', function (newval, oldval) {
                validator(ctrl.$viewValue);
            });

        }
    };
}]);
