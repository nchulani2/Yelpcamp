const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    username: {
        type: String,
        unique: true,
        required: true
    },
    password: String,
    email: {
        type: String,
        unique: true,

    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    googleID: String,
    facebookID: String,

    resetPasswordToken: String,
    resetPasswordExpires: Date

});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);