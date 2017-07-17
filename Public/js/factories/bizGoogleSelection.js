angular.module('shmib').factory('bizGoogleSelection', function () {

	var pref = {};

	var set = function (key, val) {
		this.pref[key] = val;
	};

	var get = function (key, defaultValue) {
		if (angular.isUndefined(this.pref[key]) || this.pref[key] == null) {
			return (angular.isUndefined(defaultValue)) ? null : defaultValue;
		}
		return this.pref[key];
	}

	return {
		pref: {},
		set: set,
		get: get
	};

});
