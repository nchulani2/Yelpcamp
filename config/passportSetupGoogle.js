const passport = require("passport");
const googleStrategy = require("passport-google-oauth20");
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
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSec: process.env.GOOGLE_CLIENT_SECRET
}

passport.use(new googleStrategy({
    // options for stategy
    clientID: option.clientID,
    clientSecret: option.clientSec,
    callbackURL: "http://localhost:3000/auth/google/redirect"
}, (acessToken, refreshToken, profile, done) => {
    // check if user already exists in DB
    User.findOne({
        googleID: profile._json.sub
    }).then((currentUser) => {
        if (currentUser) {
            // user already exists

            done(null, currentUser)

        } else {
            // create new user
            new User({
                googleID: profile._json.sub,
                firstName: profile._json.given_name,
                lastName: profile._json.family_name,
                username: profile._json.name,
                email: profile._json.email
            }).save().then((newUser) => {

                done(null, newUser)
            })
        }

    })
}))