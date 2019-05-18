const express = require("express");
const router = express.Router();

// model requires
const User = require("../models/user")

// nodemailer packages
// crypto is included in node, does not require installation
const nodemailer = require("nodemailer");
const async = require("async");
const crypto = require("crypto");


// API KEY
const option = {
    gmailUser: process.env.GMAIL_USER,
    gmailKey: process.env.GMAIL_PW
}

//============================================================================
//                                     PASSWORD FORGOT ROUTE
//============================================================================
router.get("/register/forgot", (req, res) => {
    res.render("authform/forgot");
})


router.post("/register/forgot", (req, res, next) => {
    // used to run an array of functions, avoid callback hell
    async.waterfall([
        function (done) {
            crypto.randomBytes(20, (err, buf) => {
                var token = buf.toString("hex");
                // the token is sent as part of the URL to the user's email address, the token expires after a designated time period
                done(err, token);
            });
        },

        function (token, done) {

            User.findOne({
                email: req.body.email
            }, (err, user) => {
                if (!user) {

                    req.flash("error", "Invalid email address. Account not found.")
                    return res.redirect("/register/forgot")
                };
                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 36000000; // 1 hour till token expires

                user.save((err) => {
                    done(err, token, user)
                });
            });
        },
        function (token, user, done) {
            // the service and the email that's sending the token
            var smtpTransport = nodemailer.createTransport({
                service: "Gmail",
                auth: {
                    user: option.gmailUser,
                    pass: option.gmailKey
                }
            });

            // what the user will see in the email  
            var mailOptions = {
                to: user.email,
                from: option.gmailUser,
                subject: "Yelpcamp Password Reset",
                html: "You are receiving this because you (or someone else) has requested the reset of your account's password. Please click on the following link to initiate the reset process: " + "<br><a href=https://yelpcampport.herokuapp.com/reset/" + token + ">Reset Password Now</a>" + "<br><br><strong>If you did not request this, please ignore this email.</strong>",


            };
            smtpTransport.sendMail(mailOptions, (err) => {
                console.log("Reset mail sent");
                req.flash("success", "Reset instructions has been sent to " + user.email + " with further instructions ");
                done(err, "done")
            });

        }
    ], function (err) {
        if (err) {
            return next(err);
        }
        res.redirect("/register/forgot")
    });
});


router.get("/reset/:token", (req, res) => {
    User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: {
            $gt: Date.now()
        }
    }, (err, user) => {
        if (!user) {
            req.flash("error", "Password reset token is no longer valid");
            return res.redirect("/register/forgot")
        }
        res.render("authform/reset", {
            token: req.params.token
        })
    })
})


router.post("/reset/:token", (req, res) => {
    async.waterfall([
        function (done) {
            User.findOne({
                resetPasswordToken: req.params.token,
                resetPasswordExpires: {
                    $gt: Date.now()
                }
            }, (err, user) => {
                if (!user) {
                    req.flash("error", "Password reset token is no longer valid");
                    return res.redirect("/register/forgot");
                }
                if (req.body.password === req.body.confirm) {
                    // setPassword from passport-local-mongoose
                    user.setPassword(req.body.password, (err) => {
                        user.resetPasswordToken = undefined;
                        user.resetPasswordExpires = undefined;

                        user.save((err) => {
                            // logIn from passport-local-mongoose
                            req.logIn(user, (err) => {
                                done(err, user);
                            })
                        })
                    })
                } else {
                    req.flash("error", "Passwords do not match");
                    res.redirect("back")
                }
            })
        },
        function (user, done) {
            var smtpTransport = nodemailer.createTransport({
                service: "Gmail",
                auth: {
                    user: option.gmailUser,
                    pass: option.gmailKey
                }
            });

            // what the user will see in the email  
            var mailOptions = {
                to: user.email,
                from: option.gmailUser,
                subject: "Your password has been changed",
                html: "<h5>Hello,</h5><br>This is a confirmation that your password for " + user.email + " has successfully been changed."


            };
            smtpTransport.sendMail(mailOptions, (err) => {
                console.log("mail sent");
                req.flash("success", "Your password has successfully been changed.");
                done(err, "done")
            }, (err) => {
                req.flash("error", "Reset instructions unable to be sent")
                return res.redirect("back")
            });

        }

    ], (err) => {
        res.redirect("/campgrounds")
    })
})

module.exports = router;