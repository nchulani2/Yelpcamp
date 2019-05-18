const express = require("express");
const passport = require("passport")
const router = express.Router();

// model requires
const User = require("../models/user")

// middleware
const middleware = require("../middleware")

// nodemailer packages
// crypto is included in node, does not require installation
const nodemailer = require("nodemailer");
const async = require("async");
const crypto = require("crypto");


// API KEY
const option = {
    adminKey: process.env.MY_ADMIN_KEY,
    gmailUser: process.env.GMAIL_USER,
    gmailKey: process.env.GMAIL_PW
}

//============================================================================
//                                     ROOT ROUTE
//============================================================================
router.get("/", (req, res) => {
    res.render(`camp/landing`);

});

router.get("/about", (req, res) => {
    res.render("camp/about")
})
//============================================================================
//                                     AUTHENTICATION ROUTES
//============================================================================
// REGISTER
router.get("/register", middleware.isAlreadyLoggedIn, (req, res) => {

    res.render("authform/register")

});

// LOCAL
router.post("/register", middleware.isAlreadyLoggedIn, (req, res) => {
    req.body.firstName = req.sanitize(req.body.firstName)
    req.body.lastName = req.sanitize(req.body.lastName)
    req.body.username = req.sanitize(req.body.username);
    req.body.email = req.sanitize(req.body.email)
    req.body.password = req.sanitize(req.body.password);
    req.body.adminCode = req.sanitize(req.body.adminCode)

    const newUser = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: req.body.username,
        email: req.body.email

    });

    // Checker for admins
    if (req.body.adminCode === option.adminKey) {
        newUser.isAdmin = true;

    } else if (req.body.adminCode !== option.adminKey && String(req.body.adminCode).length > 0 && String(req.body.adminCode).length !== 9) {
        req.flash("error", "Invalid admin code")
        return res.redirect("/register");
    }


    User.register(newUser, req.body.password, (err, user) => {
        if (err) {
            console.log(err)
            if (err.name == "UserExistsError") {
                req.flash("similar", "Sorry, that username is already taken.")
                return res.redirect("/register");
            }
            req.flash("similar", "Sorry, that email is already registered with an existing user.")
            return res.redirect("/register")


        }
        passport.authenticate("local")(req, res, () => {

            if (user.isAdmin == true) {
                req.flash("success", "Welcome to Yelpcamp, Admin " + user.username)
            } else {
                req.flash("success", "Welcome to Yelpcamp, " + user.username)

            }
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
                subject: "Welcome to Yelpcamp",
                html: "<strong>Welcome, " + user.firstName + "</strong><br><br>" + "Create your first campground now!<br> " + "<em><a href=https://www.google.com>Click here to go to Yelpcamp</a></em>"


            };
            smtpTransport.sendMail(mailOptions, (err) => {
                if (err) {
                    console.log("Unable to send welcome mail", err.message)
                } else {
                    console.log("Welcome mail sent");
                }


            });
            res.redirect(req.session.returnTo || '/campgrounds');
            delete req.session.returnTo;
        })
    })
})



router.post("/login", passport.authenticate("local", {
        successReturnToOrRedirect: "/campgrounds",
        failureRedirect: "back",
        failureFlash: "Invalid Username or Password!",
        successFlash: "Welcome back! "

    }),
    (req, res) => {})
// LOCAL END

// GOOGLE
router.get("/auth/google", passport.authenticate("google", {
    // handle google auth with passport
    scope: ["profile", "email"]

}));

router.get("/auth/google/redirect", passport.authenticate("google"), (req, res) => {
    if (req.user.isAdmin == true) {

        req.flash("success", "Welcome to Yelpcamp, Admin " + req.user.username)
    } else {
        req.flash("success", "Welcome to Yelpcamp, " + req.user.username)

    }
    res.redirect("/campgrounds")
})
// GOOGLE END

// FACEBOOK
router.get("/auth/facebook", passport.authenticate("facebook"));

router.get("/auth/facebook/redirect", passport.authenticate("facebook"), (req, res) => {
    if (req.user.isAdmin == true) {
        req.flash("success", "Welcome to Yelpcamp, Admin " + req.user.username)
    } else {
        req.flash("success", "Welcome to Yelpcamp, " + req.user.username)

    }
    res.redirect("/campgrounds")
})
// FACEBOOK END

// LOGOUT
router.get("/logout", (req, res) => {
    req.logout();
    req.flash("success", "You have successfully logged out.")
    res.redirect("/campgrounds")
})



//============================================================================
//                                     ERROR ROUTE
//============================================================================
router.get("/*", (req, res) => {
    res.render(`error/errorpage`)
})

module.exports = router;