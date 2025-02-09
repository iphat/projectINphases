const express = require("express");
const router =  express.Router({mergeParams : true});//mergeParams - Preserve the req.params values from the parent router. If the parent and the child have conflicting param names, the child’s value take precedence.
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const Review = require("../models/review.js");
const {validateReview, isLoggedIn,isReviewAuthor} = require("../middleware.js");

//Reviews (Post route)
//2- for reviews
 //without server side validation we can send empty review from other source like hoppscotch or postman which will be saved directly in DB  but now empty review not saved from any source
router.post("/",validateReview,isLoggedIn, wrapAsync(async(req,res) => {
    console.log(req.params.id);
   let listing = await Listing.findById(req.params.id);
   let newReview = new Review(req.body.review);
// this person is the author of the review
   newReview.author = req.user._id;
//    console.log(newReview);

   listing.reviews.push(newReview);

   await newReview.save();
   await listing.save();

   req.flash("success", "New review created");
   res.redirect(`/listings/${listing._id}`);
}));
//Reviews (Delete route)
router.delete("/:reviewId",isLoggedIn,isReviewAuthor,wrapAsync(async(req,res) => {
    let {id, reviewId} = req.params;

    //$pull operator removes from an existing array all instances of a value or value that matche a specified condition
    await Listing.findByIdAndUpdate(id,{$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "review deleted");
    res.redirect(`/listings/${id}`);
}))

module.exports = router;
