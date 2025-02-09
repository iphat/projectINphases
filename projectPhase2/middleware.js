const Listing = require("./models/listing.js");
const ExpressError = require("./utils/expressError.js");
const {listingSchema} = require("./schema.js");
const {reviewSchema} = require("./schema.js");
const Review = require("./models/review.js");

module.exports.isLoggedIn = (req,res,next) => {
    //click on "add new listing"
    //req.path => /new & req.originalUrl => /listings/new
    console.log(req.path,"...",req.originalUrl);

    // console.log(req.user);//we can either we are loggedin or not
        //".isAuthenticated" check is user authenticated
    //if user not authenticated then send flash msg & redirect to login page
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error","you must be logged in to create listing");
        return res.redirect("/login");
    }
    next();
}

//save the value of "req.session.redirectUrl" in locals becz when we get into '/login' passport authenticates & reset the req.session info. so it will delete the extra info. from 'user.js' '/login' like '.redirectUrl' and passport do not have access to delete the locals

module.exports.saveRedirectUrl = (req,res,next) => {
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

//we have create a middleware for this code instead of adding this code in every route & now we use that middleware in every route.
module.exports.isOwner = async(req,res,next) => {
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currUser._id)){
        req.flash("error","You are not the owner of this listing");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

//server side validation
//1- for listing

module.exports.validateListing = (req,res,next) => {
    const {error} = listingSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(",");
        throw new ExpressError(400,msg);
    }else{
        next();
    }
};

//server side validation
//2- for reviews
module.exports.validateReview = (req,res,next) => {
    let{error} = reviewSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
}

//this provide the authorization to delete the review only to the author of the review
module.exports.isReviewAuthor = async(req,res,next) => {
    let {id,reviewId} = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error","You are not the author of this review");
        return res.redirect(`/listings/${id}`);
    }
    next();
}