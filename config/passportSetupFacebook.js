const passport = require("passport");
const facebookStrategy = require("passport-facebook").Strategy;
const User = require("../models/user");

// This is only used for cookie-session when serializing ID's
// passport.serializeUser((user, done) => {
//     done(null, user.id);
// })

// passport.deserializeUser((id, done) => {
//     User.findById(id).then((user) => {
//         done(null, user.id);
//     })

// })

const option = {
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSec: process.env.FACEBOOK_CLIENT_SECRET
}

passport.use(new facebookStrategy({
    // options for stategy
    clientID: option.clientID,
    clientSecret: option.clientSec,
    profileFields: ['id', 'displayName', 'gender', 'photos', 'short_name'],
    callbackURL: "http://localhost:3000/auth/facebook/redirect"
}, (acessToken, refreshToken, profile, done) => {
    // check if user already exists in DB

    User.findOne({
        facebookID: profile._json.id
    }).then((currentUser) => {
        if (currentUser) {
            // user already exists

            done(null, currentUser)

        } else {
            // create new user
            new User({
                facebookID: profile._json.id,
                firstName: profile._json.first_name,
                lastName: profile._json.last_name,
                username: profile._json.short_name,

            }).save().then((newUser) => {

                done(null, newUser)
            })
        }

    })
}))