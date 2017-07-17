var Sequelize = require("sequelize");
var cls = require('continuation-local-storage');
var config = require('../../config');

Sequelize.cls = cls.createNamespace('shmib-tx-namespace');
var sq = new Sequelize(
    config.dbpg.database,
    config.dbpg.username,
    config.dbpg.password, {
        host: config.dbpg.hostname,
        dialect: 'postgres',
        //logging: false,
        pool: {
            max: 5,
            min: 0,
            idle: 500
        }
    });

exports.db = sq;

var review = sq.import('./review.model.js');
var reviewComment = sq.import('./reviewComment.model.js');
var company = sq.import('./company.model.js');
var contact = sq.import('./contact.model.js');
var companyContact = sq.import('./companyContact.model.js');
var coupon = sq.import('./coupon.model.js');
var referenceItem = sq.import('./referenceItem.model.js');
var appSetting = sq.import('./appSetting.model.js');
var customLabels = sq.import('./customLabels.model.js');

review.hasMany(reviewComment, {
    foreignKey: 'reviewId'
})

review.belongsTo(contact, {
    foreignKey: 'contactId',
    targetKey: 'id'
})
review.belongsTo(company, {
    foreignKey: 'companyId',
    targetKey: 'id'
})

reviewComment.belongsTo(review, {
    foreignKey: 'reviewId',
    targetKey: 'id'
})

companyContact.belongsTo(contact, {
    foreignKey: 'contactId',
    targetKey: 'id'
})

companyContact.belongsTo(company, {
    foreignKey: 'companyId',
    targetKey: 'id'
})

company.hasMany(companyContact, {
    foreignKey: 'companyId'
})
company.hasMany(customLabels, {
    foreignKey: 'company_id'
})
contact.hasMany(companyContact, {
    foreignKey: 'contactId'
})

exports.review = review;
exports.reviewComment = reviewComment;
exports.company = company;
exports.contact = contact;
exports.companyContact = companyContact;
exports.coupon = coupon;
exports.referenceItem = referenceItem;
exports.appSetting = appSetting;
exports.customLabels = customLabels;
