const express = require("express");
const router = express.Router();

// model requires
const Camp = require(`../models/camp`);
const Comment = require("../models/comment")

// middleware require - don't have to include index as express gets the index data that's inside of middleware dir
const middleware = require("../middleware")

// GEO-CODER API here
// The whole purpose of .gitignore file to hide the .env file which contains delicate information
const NodeGeocoder = require('node-geocoder');

var options = {
    provider: 'google',
    httpAdapter: 'https',
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
};

var geocoder = NodeGeocoder(options);

//INDEX - show all campgrounds
router.get("/", function (req, res) {

    var perPage = 6;
    var pageQuery = parseInt(req.query.page);
    var pageNumber = pageQuery ? pageQuery : 1;
    var noMatch = null;
    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Camp.find({
            name: regex
        }).sort({
            "_id": 1
        }).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allCamps) {
            Camp.countDocuments({
                name: regex
            }).exec(function (err, count) {
                if (err) {
                    console.log(err);
                    res.redirect("back");
                } else {
                    if (allCamps.length < 1) {
                        noMatch = "No campgrounds match that query, please try again.";
                    }
                    res.render("camp/index", {
                        campgrounds: allCamps,
                        current: pageNumber,
                        pages: Math.ceil(count / perPage),
                        noMatch: noMatch,
                        search: req.query.search
                    });
                }
            });
        });
    } else {
        // get all campgrounds from DB
        Camp.find().sort({
            "_id": 1
        }).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allCamps) {
            Camp.countDocuments().exec(function (err, count) {
                if (err) {
                    console.log(err);
                } else {
                    res.render("camp/index", {
                        campgrounds: allCamps,
                        current: pageNumber,
                        pages: Math.ceil(count / perPage),
                        noMatch: noMatch,
                        search: false
                    });
                }
            });
        });
    }
});

// NEW CAMP - renders form to create new camp
router.get("/new", middleware.isLoggedIn, (req, res) => {
    res.render(`camp/new.ejs`)
});

// CREATE CAMP -- add new campgorund to database
router.post("/", middleware.isLoggedIn, middleware.isSafe, (req, res) => {
    req.body.camp.name = req.sanitize(req.body.camp.name)
    req.body.camp.image = req.sanitize(req.body.camp.image)
    req.body.camp.description = req.sanitize(req.body.camp.description)
    req.body.camp.price = req.sanitize(req.body.camp.price)
    req.body.camp.location = req.sanitize(req.body.camp.location)
    var author = {
        id: req.user._id,
        username: req.user.username
    };


    geocoder.geocode(req.body.camp.location, (err, data) => {
        if (err || !data.length) {
            req.flash("error", "Invalid address");
            return res.redirect("back")
        }
        var lat = data[0].latitude;
        var lng = data[0].longitude;
        var location = data[0].formattedAddress;



        var newCamp = {
            name: req.body.camp.name,
            image: req.body.camp.image,
            description: req.body.camp.description,
            price: req.body.camp.price,
            location: req.body.camp.location,
            lat: lat,
            lng: lng,
            author
        };
        //creating a new camp to the database
        Camp.create(newCamp, (err, newcamp) => {
            if (err) {
                req.flash("error", "Unable to create camp")
                res.redirect("back")
            } else {

                // new camp is what the user inputs on the form
                req.flash("success", "Campground created!")
                res.redirect(req.session.returnTo || '/campgrounds');
                delete req.session.returnTo;
            }
        });
    });
})

// SHOW CAMP - displays info regarding the camp
router.get("/:id", (req, res) => {
    // find the campground with provided ID
    Camp.findById(req.params.id).populate("comments").exec((err, foundCamp) => {
        req.session.returnTo = req.originalUrl;
        if (err || !foundCamp) {
            req.flash("error", "Camp not found.")
            return res.redirect("/campgrounds")
        } else {
            // render show template regarding that ID

            res.render(`camp/show`, {
                campgrounds: foundCamp,
                option: options
            })
        }
    })
})

// SHOW NEXT CAMP - displays info regarding the camp
router.get("/:id/next", (req, res) => {
    // find the campground with provided ID
    Camp.findById({
        $gt: req.params.id
    }).populate("comments").exec((err, foundCamp) => {
        req.session.returnTo = req.originalUrl;
        if (err || !foundCamp) {
            req.flash("error", "Camp not found.")
            return res.redirect("/campgrounds")
        } else {
            // render show template regarding that ID

            res.render(`camp/show`, {
                campgrounds: foundCamp,
                option: options
            })
        }
    })
})


//EDIT CAMP
router.get("/:id/edit", middleware.isLoggedIn, middleware.checkCampOwnership, (req, res) => {

    Camp.findById(req.params.id, (err, foundCamp) => {
        res.render("camp/edit", {
            camp: foundCamp
        })
    })
})

//UPDATE CAMP
router.put("/:id", middleware.isLoggedIn, middleware.checkCampOwnership, middleware.isSafe, (req, res) => {
    req.body.camp.name = req.sanitize(req.body.camp.name);
    req.body.camp.image = req.sanitize(req.body.camp.image);
    req.body.camp.description = req.sanitize(req.body.camp.description);
    req.body.camp.price = req.sanitize(req.body.camp.price);
    req.body.camp.location = req.sanitize(req.body.camp.location)



    geocoder.geocode(req.body.camp.location, (err, data) => {
        if (err || !data.length) {
            req.flash("error", "Invalid address");
            return res.redirect("back")
        }
        req.body.camp.lat = data[0].latitude;
        req.body.camp.lng = data[0].longitude;
        req.body.camp.location = data[0].formattedAddress;

        Camp.findByIdAndUpdate(req.params.id, req.body.camp, (err, editedCamp) => {
            if (err) {
                res.redirect("back")
            } else {
                req.flash("success", "Camp updated.")
                res.redirect(req.session.returnTo || '/campgrounds/{req.params.id}');
                delete req.session.returnTo;
            }
        });
    });
})

//DESTROY CAMP
router.delete("/:id", middleware.isLoggedIn, middleware.checkCampOwnership, (req, res) => {

    Camp.findByIdAndRemove(req.params.id, (err, removedCamp) => {
        if (err) {
            res.redirect("back")

        } else {

            Comment.deleteMany({
                _id: {
                    $in: removedCamp.comments
                }
            }, (err) => {
                if (err) {
                    console.log(err)
                } else {

                    req.flash("success", "Camp removed.")
                    res.redirect('/campgrounds');

                }
            })
        }
    })
})


//regex function to replace text for search capabilities among camps
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;