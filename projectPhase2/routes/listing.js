const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/expressError.js");
const {listingSchema} = require("../schema.js");

//server side validation
//1-for listing
const validateListing = (req, res, next) => {
    let{ error} = listingSchema.validate(req.body);
    console.log(error);
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
}

//Index Route
router.get("/",async (req,res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings});
  });
  
  //New Route
  router.get("/new",(req,res) => {
      res.render("listings/new.ejs");
  });
  
  //Show Route
  //becz of "/listings/:id" so in "/listings/new" app.js  take /new as 'id' so we put "new route" upper side of "show route"
  router.get("/:id", async(req, res) => {
      let { id } = req.params;
      const listing = await Listing.findById(id).populate("reviews");
      res.render("listings/show.ejs", { listing });
    });
  
  
  //custom error handling is applied on "create route"  
  //Create Route
  router.post("/",validateListing,wrapAsync(async(req,res,next) => {//wrapAsync function is better way to write try & catch

  //this is one type to get value but another way is in "new.ejs"    
    // let{title, description, image, price, country, location} = req.body;  
    const newListing = new Listing(req.body.listing);
     await newListing.save();
     res.redirect("/listings");
  })
  );
  
  //Edit Route
  router.get("/:id/edit", async(req,res) => {
      let {id} = req.params;
      const listing = await Listing.findById(id);
      
      if(!listing){
        req.flash("error","listing does not exists");
        res.redirect("/listings");
      }
      res.render("listings/edit.ejs",{listing});
  });
  
  //Update Route
  router.put("/:id",validateListing, async(req,res) => {
      // if(!req.body.listing){
      //     throw new ExpressError(400,"send valid data for listing ");
      // }
     let {id} = req.params;
      await Listing.findByIdAndUpdate(id,{...req.body.listing});//(...)is a spread opertator
      
      req.flash("success", "listing updated");
      // res.redirect("/listings");
      res.redirect(`/listings/${id}`);//for redirect at "show" page
  });
  
  //Delete Route
  router.delete("/:id", async(req,res) => {
      let {id} = req.params;
      let deleteListing = await Listing.findByIdAndDelete(id);
      req.flash("success","listing deleted");
      res.redirect("/listings");
      console.log(deleteListing);
  });
  
  module.exports = router;