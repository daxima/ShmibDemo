var config = require("../../config"),
    nodemailer = require("nodemailer"),
    fs = require("fs"),
    logger = require('../../logger.js');

var smtpTransport = nodemailer.createTransport(config.smtpConfig);

exports.SendEmail = function (to, subject, siteLogoURL, bodymessage) {

    var template_header_location = "app/views/templates/email_header_template.txt";
    var template_footer_location = "app/views/templates/email_footer_template.txt";

    var contents_header = fs.readFileSync(template_header_location, 'utf8');
    var contents_footer = fs.readFileSync(template_footer_location, 'utf8');

    contents_header = contents_header.replace('{{logoURL}}', siteLogoURL + '/images/logo.png');

    var mailOptions = {
        from: config.smtpConfig.auth.user, // sender address
        to: to,
        subject: subject,
        html: contents_header + bodymessage + contents_footer
            //         ,
            //            attachments: [{
            //                filename: "logo.png",
            //                filePath: "public/img/logo_email.png",
            //                cid: "logo" //same cid value as in the html img src
            //            }]

    };

    // send mail with defined transport object
    smtpTransport.sendMail(mailOptions, function (error, response) {
        if (error) {
            logger.error('err=' + error.toString());
            return false;
        } else {
            return true;
        }
    });
};

exports.SendEmailTemplate = function (mailInfo, apiname) {
    var htmlcontents = '';
    var template_header_location = "app/views/templates/email_header_template.txt";
    var template_footer_location = "app/views/templates/email_footer_template.txt";
    var template_location = "app/views/templates/email_" + apiname + "_template.txt";

    var contents_header = fs.readFileSync(template_header_location, 'utf8');
    var contents_footer = fs.readFileSync(template_footer_location, 'utf8');
    var contents = fs.readFileSync(template_location, 'utf8');

    htmlcontents = contents;

    if (mailInfo.urllink) {
        var urllink = mailInfo.urllink;
        htmlcontents = htmlcontents.replace('{{urllink}}', urllink);
    }

    if (mailInfo.invitee_firstname) {
        var invitee_firstname = mailInfo.invitee_firstname;
        htmlcontents = htmlcontents.replace('{{invitee_firstname}}', invitee_firstname);
    }

    if (mailInfo.invitee_lastname) {
        var invitee_lastname = mailInfo.invitee_firstname;
        htmlcontents = htmlcontents.replace('{{invitee_lastname}}', invitee_lastname);
    }

    if (mailInfo.firstname) {
        var firstname = mailInfo.firstname;
        htmlcontents = htmlcontents.replace('{{firstname}}', firstname);
    }

    if (mailInfo.lastname) {
        var lastname = mailInfo.lastname;
        htmlcontents = htmlcontents.replace('{{lastname}}', lastname);
    }

    if (mailInfo.companyname) {
        var companyname = mailInfo.companyname;
        htmlcontents = htmlcontents.replace('{{companyname}}', companyname);
    }


    var mailOptions = {
        from: config.smtpConfig.auth.user,
        to: mailInfo.to,
        subject: mailInfo.subject,
        html: contents_header + htmlcontents + contents_footer
            //        attachments: [{
            //                filename: "logo.png",
            //                filePath: "public/img/logo_email.png",
            //                cid: "logo" //same cid value as in the html img src
            //            }]
    };

    // send mail with defined transport object
    smtpTransport.sendMail(mailOptions, function (error, response) {
        if (error) {
            logger.error('err=' + error.toString());
            return false;
        } else {
            return true;
        }
    });
}

exports.SendReviewerEmailTemplate = function (mailInfo, apiname) {
    var htmlcontents = '';
    var template_header_location = "app/views/templates/email_header_template.txt";
    var template_footer_location = "app/views/templates/email_footer_template.txt";
    var template_location = "app/views/templates/email_" + apiname + "_template.txt";

    var contents_header = fs.readFileSync(template_header_location, 'utf8');
    var contents_footer = fs.readFileSync(template_footer_location, 'utf8');
    var contents = fs.readFileSync(template_location, 'utf8');

    htmlcontents = contents;

    if (mailInfo.siteURL) {
        var siteLogoURL = mailInfo.siteURL + '/images/logo.png';
        contents_header = contents_header.replace('{{logoURL}}', siteLogoURL);
    }

    if (mailInfo.pageUrl) {
        var pageUrl = mailInfo.pageUrl;
        htmlcontents = htmlcontents.replace('{{pageUrl}}', pageUrl);
    }

    if (mailInfo.firstname) {
        var firstname = mailInfo.firstname;
        htmlcontents = htmlcontents.replace('{{firstname}}', firstname);
    }


    if (mailInfo.companyname) {
        var companyname = mailInfo.companyname;
        htmlcontents = htmlcontents.replace('{{companyname}}', companyname);
    }

    if (mailInfo.currentday) {
        var currentday = mailInfo.currentday;
        htmlcontents = htmlcontents.replace('{{currentday}}', currentday);
    }

    if (mailInfo.pageLink) {
        var pageLink = mailInfo.pageLink;
        htmlcontents = htmlcontents.replace('{{pageLink}}', pageLink);
    }


    var mailOptions = {
        from: config.smtpConfig.auth.user,
        to: mailInfo.to,
        subject: mailInfo.subject,
        html: contents_header + htmlcontents + contents_footer

    };

    //send mail with defined transport object
    smtpTransport.sendMail(mailOptions, function (error, response) {
        if (error) {
            logger.error('err=' + error.toString());
            // throw err;
            return false;
        } else {
            return true;
        }
    });

}
