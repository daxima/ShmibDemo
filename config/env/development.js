// Invoke 'strict' JavaScript mode 'use strict';
var dateObj = new Date(Date.now());
// Set the 'development' environment configuration object
module.exports = {

    dbpg: {
        hostname: 'localhost',
        username: 'shmib',
        password: '19@Chucks0ny',
        database: 'Shmib'
    },

    /*
        dbpg: {
            hostname: '127.0.0.1',
            username: 'postgres',
            password: 'admin',
            database: 'Shmib'
        },
    */
    sessionSecret: 'developmentSessionSecret',
    gmail_user: 'info@daxima.com',
    gmail_pass: 'chucks0ny',
    googlePlacesKey: 'AIzaSyAHSTHqhJkd21Lv_zthjtcLi7twsOMkyRs', 
    //googlePlacesKey: 'AIzaSyAwGq2LOuBiLQIeAZIt6SeLiSTC9P_Hv74', //Hardcoded IP for Dev2 Shaunak 50.254.137.123
    //googlePlacesKey: 'AIzaSyBngPfbXpbU2FAIsFqY0bnws_6hbNslhAw', // GMaps http website level key
    //old -- shaunaktest@gmail.com -- https://console.developers.google.com/apis/credentials/key/1?project=sodium-pathway-755
    // Dec29,2016 -- info@daxima.com -- https://console.developers.google.com/apis/credentials?project=shmib-154000

    googlePlacesResponseType: 'json',
    googlePlacesResultLimit: 7,
    currentdate: (dateObj.getMonth() + 1) + '/' + dateObj.getDate() + '/' + dateObj.getFullYear(),
    currentdatetime: dateObj.getFullYear() + '-' + (dateObj.getMonth() + 1) + '-' + dateObj.getDate() + ' ' + dateObj.getHours() + ":" + dateObj.getMinutes() + ":" + dateObj.getSeconds()

};
