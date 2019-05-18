const middlewareObj = new Object;
const Camp = require("../models/camp")
const Comment = require("../models/comment")
const User = require("../models/user")
//============================================================================
//                                     MIDDLEWARES 
//============================================================================
middlewareObj.isLoggedIn = function isLoggedIn(req, res, next) {
    req.session.returnTo = req.originalUrl
    if (req.isAuthenticated()) {
        next();
    } else {
        req.flash("error", "Please sign in!")
        res.redirect("/register");
    }

}

middlewareObj.isAlreadyLoggedIn = function isAlreadyLoggedIn(req, res, next) {
    if (!req.isAuthenticated()) {
        next();
    } else {
        req.flash("error", "You are already signed in as " + req.user.username);
        res.redirect("/campgrounds");
    }
}

middlewareObj.isSafe = function isSafe(req, res, next) {
    if (req.body.camp.image.match(/^https:\/\/images\.unsplash\.com\/.*/) || req.body.camp.image.match(/^https:\/\/cdn\.stocksnap\.io\/.*/) || req.body.camp.image.match(/^https:\/\/images\.pexels\.com\/.*/) || req.body.camp.image.match(/^https:\/\/res\.cloudinary\.com\/twenty20\/.*/)) {
        next();
    } else {
        req.flash("error", "Only images from one of the following websites are allowed: <br><ul><li>www.unsplash.com</li><li>www.stocksnap.io</li><li>www.pexels.com</li><li>www.reshot.com</li></ul>");
        res.redirect("back")
    }

}

middlewareObj.checkCampOwnership = function checkCampOwnership(req, res, next) {

    Camp.findById(req.params.id, (err, foundCamp) => {
        if (err || !foundCamp) {
            req.flash("error", "Camp not found.")
            res.redirect("/campgrounds")

        } else {
            // does user own the campground? The id's may look the same but they're different behind the scenes
            // foundCamp.author.id is a mongoose object
            // req.user._id is a string
            // use mongoose method .equals to check 
            if (foundCamp.author.id.equals(req.user._id) || req.user.isAdmin) {
                next();
            } else {
                req.flash("error", "Access denied. Permission not allowed.")
                res.redirect("/campgrounds/" + req.params.id)
            }
        }
    })

}

middlewareObj.checkCommentOwnership = function checkCommentOwnership(req, res, next) {

    Comment.findById(req.params.comment_id, (err, foundComment) => {
        if (err || !foundComment) {
            req.flash("error", "Comment not found.")
            res.redirect("/campgrounds/")
        } else {
            // does user own the comment? The id's may look the same but they're different behind the scenes
            // foundComment.author.id is a mongoose object
            // req.user._id is a string
            // use mongoose method .equals to check 
            if (foundComment.author.id.equals(req.user._id) || req.user.isAdmin) {
                next();
            } else {
                req.flash("error", "Access denied. Permission not allowed.")
                res.redirect("/campgrounds")
            }
        }

    })

}

module.exports = middlewareObj