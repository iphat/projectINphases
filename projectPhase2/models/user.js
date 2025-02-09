const mongoose = require ("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    email: {
        type: String,
        required : true,
    }
});

//passportLocalMongoose - we use this becz it automatically add username,hashing, salting & hashed password.
//Additionally, Passport-Local Mongoose adds some methods to your Schema.check npm "passport-local-mongooose" package.
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User',userSchema)