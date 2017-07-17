var dateObj = new Date(Date.now());
module.exports = {

    azure: {
        instrumentationKey: '385bddb7-8210-4d36-afb0-7baf0bf376f9'
    },
    version: 'v2.0.1',
    dbpg: {
        hostname: 'localhost',
        username: 'postgres',
        password: 'test',
        database: 'shmib_demo'
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
    smtpConfig: {
        server: 'Office365',
        host: 'smtp.office365.com',
        port: 587,
        secure: false,
        auth: {
            user: 'info@shmib.com',
            pass: 'Shmibinfo#1'
        }
    },
    googlePlacesKey: 'AIzaSyAe_cZ-dJuKV3VJvAQrqpUstpMIbTIzdY0', 
    //googlePlacesKey: 'AIzaSyAwGq2LOuBiLQIeAZIt6SeLiSTC9P_Hv74', //Hardcoded IP for Dev2 Shaunak 50.254.137.123
    //googlePlacesKey: 'AIzaSyBngPfbXpbU2FAIsFqY0bnws_6hbNslhAw', // GMaps http website level key
    //old -- shaunaktest@gmail.com -- https://console.developers.google.com/apis/credentials/key/1?project=sodium-pathway-755
    // Dec29,2016 -- info@daxima.com -- https://console.developers.google.com/apis/credentials?project=shmib-154000

    googlePlacesResponseType: 'json',
    googlePlacesResultLimit: 100,
    currentdate: (dateObj.getMonth() + 1) + '/' + dateObj.getDate() + '/' + dateObj.getFullYear(),
    currentdatetime: dateObj.getFullYear() + '-' + (dateObj.getMonth() + 1) + '-' + dateObj.getDate() + ' ' + dateObj.getHours() + ":" + dateObj.getMinutes() + ":" + dateObj.getSeconds(),
    siteProtocol: 'https://'

};
