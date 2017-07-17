app.service('api', function($http) {
    
    return {
        signup: function(userObj){
            return $http.post('/api/auth/signup', userObj)
                .success(function(result) {
                    return result.data; 
                }).error(function(err){
                    console.log(err);
                    return err;
                });
        },
        signupuser: function(userObj){
            return $http.post('/help/signup', userObj)
                .success(function(result) {
                    return result.data; 
                }).error(function(err){
                    console.log(err);
                    return err;
                });
        },
//       signin: function(authObj){
//            return $http.post('/api/auth/login', authObj)
//                .success(function(result){
//                    return result.data; 
//                }).error(function(err){
//                    console.log(err);
//                    return err;
//                });
//        },
        propertyadd: function(propertyObj){
            return $http.post('/property/add ', propertyObj)
                   .success(function(result){
                        return result.data;
                    }).error(function(err){
                            return err;
                    });
        },
        propertyupdate: function(propertyObj, propertyId){
            return $http.post('/property/update/'+propertyId, propertyObj)
                   .success(function(result){
                        return result.data;
                    }).error(function(err){
                            return err;
                    });
        },
        latLong: function(address){
            return $http.post('https://maps.googleapis.com/maps/api/geocode/json?address='+address+'&key=AIzaSyABNLj7JH5IAXMJndJ4bXA3G6oyF88g1V4')
                   .success(function(result){
                        return result.data;
                    }).error(function(err){
                            return err;
                    });
        },
        setInfrequent: function(propertyObj){
            return $http.post('/property/setInfrequent', propertyObj)
                   .success(function(result){
                        return result.data;
                    }).error(function(err){
                        return err;
                    });
        },
        setFrequent: function(propertyObj){
            return $http.post('/property/setFrequent', propertyObj)
                   .success(function(result){
                        return result.data;
                    }).error(function(err){
                        return err;
                    });
        },
        updateAvailability: function(availabilityObj){
            return $http.post('/availability/update', availabilityObj)
                    .success(function(result){
                        return result.data;
                    }).error(function(err){
                        return err;
                    });
        },
        getAvailability: function(propertyId){
            return $http.get('/getavailability/'+propertyId)
                   .success(function(result){
                        return result.data;
                    }).error(function(err){
                        return err;
                    });
        },
        makeUnavailable: function(availabilityObj){
            return $http.post('/makeunavailable', availabilityObj)
                    .success(function(result){
                        return result.data;
                    }).error(function(err){
                        return err;
                    });
        },
         madeUnavailable: function(propertyId){
            return $http.get('/madeunavailable/'+propertyId)
                    .success(function(result){
                        return result.data;
                    }).error(function(err){
                        return err;
                    });
        },
        uploadFile: function(){
            return $http.get('/upload/'+propertyId)
                    .success(function(result){
                        return result.data;
                    }).error(function(err){
                        return err;
                    });
        },
        upload: function(file, fileHeader){
            return $http.post('/upload', file, fileHeader)
                    .success(function(result){
                        return result.data;
                    }).error(function(err){
                        return err;
                    });
        },
        propertyList: function(propertyObj){
            return $http.post('/property/list', propertyObj)
                    .success(function(result){
                        return result.data;
                    }).error(function(err){
                        return err;
                    });
        },
        propertyPics: function(propertyId){
            return $http.get('/property/pics/'+propertyId)
                    .success(function(result){
                        return result.data;
                    }).error(function(err){
                        return err;
                    });
        },
        propertyPicRemove : function(picObj){
            return $http.post('/property/removepic', picObj)
                    .success(function(result){
                        return result.data;
                    }).error(function(err){
                        return err;
                    });
        },
        propertyPicUpdate : function(picObj){
            
            return $http.post('/property/picupdate', picObj)
                    .success(function(result){
                        return result.data;
                    }).error(function(err){
                        return err;
                    });
        },
//        signinUser: function(authObj){
//            return $http.post('/api/auth/login', authObj)
//                .success(function(result){
//                    return result.data; 
//                }).error(function(err){
//                    console.log(err);
//                    return err;
//                });
//        },
        
    }
    
});