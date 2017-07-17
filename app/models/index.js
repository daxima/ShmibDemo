"use strict";

var fs = require("fs");
var path = require("path");
var Sequelize = require("sequelize");
var env = process.env.NODE_ENV || "development";
//var config = require('../../config/config');
var config = require(path.join(__dirname, '../', '../', 'config'))

//var config    = require(__dirname + '/../config/config.json')[env];
var sequelize = new Sequelize(config.dbpg.database, config.dbpg.username, config.dbpg.password, {
    host: config.dbpg.hostname,
    dialect: 'postgres',
    //  dialect: 'mysql',

    pool: {
        max: 5,
        min: 0,
        idle: 500
    },

    define: {
        timestamps: false,
        id: false
    }

    //  logging: false //Prevent Sequelize from outputting SQL to the console on execution of query
});
var db = {};

fs
    .readdirSync(__dirname)
    .filter(function (file) {
        return (file.indexOf(".") !== 0) && (file !== "index.js" && file !== "config.js");
    })
    .forEach(function (file) {
        var model = sequelize.import(path.join(__dirname, file));
        db[model.name] = model;
    });

Object.keys(db).forEach(function (modelName) {
    if ("associate" in db[modelName]) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
//db.Sequelize = Sequelize;

module.exports = db;
