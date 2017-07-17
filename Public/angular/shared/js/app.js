// app.js

var shmib = angular.module('shmib', ['ngRoute', 'ui.router', 'ngAnimate', 'ngCookies', 'ui.bootstrap', 'tc.chartjs', 'ui.mask', 'ngAnimate', 'ngLodash', 'ngFileUpload','ngAutocomplete', 'oc.lazyLoad', 'angular-growl']);

shmib.constant('appConfig', {
	folders: {
		ReviewerView: 'angular/reviewer/views/',
		Reviewercontroller: 'angular/reviewer/controllers/',
        SharedJS: 'angular/shared/js/',
        SharedCSS: '../css/',
    }
});

shmib.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$urlMatcherFactoryProvider', 'appConfig', function ($stateProvider, $urlRouterProvider, $locationProvider, $urlMatcherFactoryProvider, appConfig) {

    $locationProvider.html5Mode(true);
    $urlMatcherFactoryProvider.caseInsensitive(true); // Allow case-insensitive URL.
    $urlMatcherFactoryProvider.strictMode(false); // Ignore trailing slash (/) in the URL (Ex: '/test/' is the same as '/test').

    $urlRouterProvider.otherwise('/angular/biz/search');


    $stateProvider.state('bizSearch', {
        url: "/angular/biz/search", 
        templateUrl: appConfig.folders.ReviewerView+'bizsearch.html',
        controller: 'bizsearchController',
        resolve: { // Any property in resolve should return a promise and is executed before the view is loaded
            loadjs: ['$ocLazyLoad', function($ocLazyLoad) {
              // you can lazy load files for an existing module
                     return $ocLazyLoad.load([
                         appConfig.folders.Reviewercontroller+'bizsearchController.js',
                         appConfig.folders.SharedCSS+'ionicons.css',
                         appConfig.folders.SharedCSS+'profile.css',
                         appConfig.folders.SharedCSS+'style.css',
                     ]);
            }]
        }
    });

}]);