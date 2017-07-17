"use strict";

module.exports = function (sequelize, DataTypes) {
    var AppSetting = sequelize.define('appSetting', {
        appSettingId: {
            type: DataTypes.TEXT
            //primaryKey: true,
           // autoIncrement: true
        },
		value: {
			type: DataTypes.TEXT
		}
	
    },{freezeTableName: true});

    return AppSetting;
};
