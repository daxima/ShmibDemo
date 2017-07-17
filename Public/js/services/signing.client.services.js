app.service('UserService', function ($http, $cookies) {

    return {
        signup: function (userObj) {
            return $http.post('/api/auth/signup', userObj).then(function (result) {
                return result.data;
            }).catch(function (err) {
                return err;
            });
        },
        emailCheck: function (emailAddress, isContact) {
            return $http.get('/api/auth/emailcheck?email=' + emailAddress + '&isContact=' + isContact).then(function (result) {
                return result.data;
            }).catch(function (err) {
                return err;
            });
        },
        phoneCheck: function (phoneNumber, isContact) {
            return $http.get('/api/auth/checkphone?phone=' + phoneNumber + '&isContact=' + isContact).then(function (result) {
                return result.data;
            }).catch(function (err) {
                return err;
            });
        },
        restaurantCheck: function (business) {
            return $http.get('/api/business/get?company=' + business).then(function (result) {
                return result.data;
            }).catch(function (err) {
                return err;
            })
        },
        addBusiness: function (businessObj) {
            return $http.post('/api/business/add', businessObj).then(function (result) {
                return result;
            }).catch(function (err) {
                return err;
            })
        },
        addGoogleBusiness: function (businessObj) {
            return $http.post('/api/business/google/add', businessObj).then(function (result) {
                return result.data;
            }).catch(function (err) {
                return err;
            });
        },
        forgotpwd: function (emailAddress) {
            return $http.post('/api/auth/forgotpassword', emailAddress).then(function (result) {
                return result;
            }).catch(function (err) {
                return err;
            });
        },
        updatepwd: function (userObj) {
            return $http({
                method: 'POST',
                headers: {
                    Authorization: 'Bearer ' + $cookies.get('token')
                },
                url: '/api/auth/updatepassword',
                data: JSON.stringify(userObj)
            }).then(function (result) {
                return result.data;
            }).catch(function (err) {
                return err;
            });
        },
        getReferenceGroup: function (group) {
            return $http.get('/api/referenceItem/get?group=' + group).then(function (result) {
                return result.data;
            }).catch(function (err) {
                return err;
            });
        },
        getReviewById: function (reviewId) {
            return $http({
                method: 'GET',
                headers: {
                    Authorization: 'Bearer ' + $cookies.get('token')
                },
                url: '/api/review/get?reviewId=' + reviewId + '&with=comment,contact'
            }).then(function (result) {
                return result.data;
            }).catch(function (err) {
                return err;
            });
        },
        sendComment: function (commentObj) {
            return $http({
                method: 'POST',
                headers: {
                    Authorization: 'Bearer ' + $cookies.get('token')
                },
                url: '/api/review/comment/add-img',
                data: JSON.stringify(commentObj)
            }).then(function (result) {
                return result.data;
            }).catch(function (err) {
                return err;
            });
        },
        getCurrentMonthReviews: function (companyId, startDate, endDate) {
            return $http.get('/api/business/report/get?companyId=' + companyId + '&startDate=' + startDate + '&endDate=' + endDate)
                .then(function (result) {
                    return result.data;
                }).catch(function (err) {
                    return err;
                });
        },
        resetpwd: function (resetPwdObj) {
            return $http.post('/api/auth/passwordreset', resetPwdObj).then(function (result) {
                return result.data;
            }).catch(function (err) {
                return err;
            });
        },
        updateProject: function (profileObj) {
            return $http({
                method: 'POST',
                headers: {
                    Authorization: 'Bearer ' + $cookies.get('token')
                },
                url: '/api/business/update',
                data: JSON.stringify(profileObj)
            }).then(function (result) {
                return result;
            }).catch(function (err) {
                return err;
            });
        },
        getCouponById: function (couponId) {
            return $http.get('/api/coupon/get?couponId=' + couponId).then(function (result) {
                return result.data;
            }).catch(function (err) {
                return err;
            });
        },
        updateCoupon: function (couponObj) {
            return $http.post('/api/coupon/update', couponObj).then(function (result) {
                return result.data;
            }).catch(function (err) {
                return err;
            });
        },
        addCoupon: function (couponObj) {
            return $http.post('/api/coupon/add', couponObj).then(function (result) {
                return result.data;
            }).catch(function (err) {
                return err;
            });
        },
        saveReview: function (reviewObj) {
            return $http.post('/api/review/add', reviewObj).then(function (result) {
                return result.data;
            }).catch(function (err) {
                return err;
            });
        },
        getUserBusinesses: function () {
            return $http.get('/api/user/business/list').then(function (result) {
                return result.data;
            }).catch(function (err) {
                return err;
            });
        },
        getBusinessDetail: function (id) {
            return $http.get('/api/business/get?id=' + id).then(function (result) {
                return result.data;
            }).catch(function (err) {
                return err;
            });
        },
        updateReview: function (reviewObj) {
            return $http.post('/api/review/update', reviewObj).then(function (result) {
                return result.data;
            }).catch(function (err) {
                return err;
            });
        },
        getAllBusiness: function () {
            return $http.get('/api/business/list').then(function (result) {
                return result.data;
            }).catch(function (err) {
                return err;
            });
        },
        updateUserProfile: function (profileObj) {
            return $http({
                method: 'POST',
                headers: {
                    Authorization: 'Bearer ' + $cookies.get('token')
                },
                url: '/api/user/update',
                data: JSON.stringify(profileObj)
            }).then(function (result) {
                return result.data;
            }).catch(function (err) {
                return err;
            });
        },
        changUserPassword: function (resetPwdObj) {
            return $http.post('/api/auth/changepassword', resetPwdObj).then(function (result) {
                return result.data;
            }).catch(function (err) {
                return err;
            });
        },
        signinUser: function (user) {
            return $http.post('/api/auth/login', user).then(function (result) {
                return result.data;
            }).catch(function (err) {
                return err;
            });
        },
        signinBiz: function (user) {
            return $http.post('/api/auth/login/biz', user).then(function (result) {
                return result.data;
            }).catch(function (err) {
                return err;
            });
        },
        //        bizSearch: function (text) {
        //            return $http.get('/api/business/search?searchtext=' + text).then(function (result) {
        //                return result.data;
        //            }).catch(function (err) {
        //                return err;
        //            });
        //        },
        bizGoogleSearch: function (text, bizlat, bizlng) {
            return $http.get('/api/business/googlesearch?searchtext=' + text + '&bizlat=' + bizlat + '&bizlng=' + bizlng).then(function (result) {
                return result.data;
            }).catch(function (err) {
                return err;
            });
        },
        bizGoogleSearchDetail: function (placeId) {
            return $http.get('/api/business/googlesearchdetail?place_id=' + placeId).then(function (result) {
                return result.data;
            }).catch(function (err) {
                return err;
            });
        },
        bizGoogleSearchCities: function (text) {
            return $http.get('/api/business/googlesearchcities?searchtext=' + text).then(function (result) {
                return result.data;
            }).catch(function (err) {
                return err;
            });
        },
        emailverification: function (tuid) {
            return $http.get('/api/auth/emailverification?tuid=' + tuid).then(function (result) {
                return result.data;
            }).catch(function (err) {
                return err;
            });
        },
        updateProfileImage: function (imgName, companyId) {
            return $http.post('/api/business/updateProfileImage?imgname=' + imgName + '&companyId=' + companyId).then(function (result) {
                return result.data;
            }).catch(function (err) {
                return err;
            });
        },
        getReviews: function (userId, id, startDate, endDate) {
            return $http({
                method: 'GET',
                headers: {
                    Authorization: 'Bearer ' + $cookies.get('token')
                },
                url: '/api/review/list?userid=' + userId + '&id=' + id + '&startDate=' + startDate + '&endDate=' + endDate
            }).then(function (result) {
                return result.data;
            }).catch(function (err) {
                return err;
            });
        },
        getUserProfile: function () {
            return $http.get('/api/user/profile').then(function (result) {
                return result.data;
            }).catch(function (err) {
                return err;
            });
        },
        //        logout: function () {
        //            return $http.get('/api/auth/logout').then(function (result) {
        //                return result;
        //            }).catch(function (err) {
        //                return err;
        //            });
        //        }
    }
});
