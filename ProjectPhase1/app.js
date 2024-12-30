const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/expressError.js");
const {listingSchema} = require("./schema.js");
// const { errorMonitor } = require("events");

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended : true}));
app.use(methodOverride("_method"));
// app.engine('ejs', engine);
//or
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname,"/public")));



const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

async function main(){
    await mongoose.connect(MONGO_URL);
}
main()
.then(() => {
    console.log("connected to DB")
})
.catch((err) => {
    console.log(err);
});


app.get("/", (req,res) => {
    res.send("Hi I am Iphat");
});

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
app.get("/listings",async (req,res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs",{allListings});
});

//New Route
app.get("/listings/new",(req,res) => {
    res.render("listings/new.ejs");
});

//Show Route
//becz of "/listings/:id" so in "/listings/new" app.js  take /new as 'id' so we put "new route" upper side of "show route"
app.get("/listings/:id", async(req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", { listing });
  });


//custom error handling is applied on "create route"  
//Create Route
app.post("/listings",validateListing,wrapAsync(async(req,res,next) => {//wrapAsync function is better way to write try & catch

//either we use this
// let result = listingSchema.validate(req.body);
// console.log(result);
//or this
//    if(!newListing.title){
//     throw new  ExpressError(400,"Title is missing");
//    }
//    if(!newListing.description){
//     throw new  ExpressError(400,"Description is missing");
//    }
//    if(!newListing.location){
//     throw new  ExpressError(400,"Location is missing");
//    }
// if(result.error) {
//     throw new ExpressError(400,result.error);
// }

//this is one type to get value but another way is in "new.ejs"    
  // let{title, description, image, price, country, location} = req.body;  
  const newListing = new Listing(req.body.listing);
   await newListing.save();
   res.redirect("/listings");
})
);

//Edit Route
app.get("/listings/:id/edit", async(req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
});

//Update Route
app.put("/listings/:id",validateListing, async(req,res) => {
    // if(!req.body.listing){
    //     throw new ExpressError(400,"send valid data for listing ");
    // }
   let {id} = req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});//(...)is a spread opertator
    
    // res.redirect("/listings");
    res.redirect(`/listings/${id}`);//for redirect at "show" page
});

//Delete Route
app.delete("/listings/:id", async(req,res) => {
    let {id} = req.params;
    let deleteListing = await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
    console.log(deleteListing);
});

//install - npm i ejs-mate - It helps in creating templete 


// app.get("/testListing",async (req,res) => {
//     let sampleListing = new Listing({
//         title: "My new Villa",
//         description:"By the beach",
//         price:1200,
//         location:"Calangute, Goa",
//         contry:"India"
//     });
//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successful testing");
// });

app.all("*",(req,res,next) => {
    next(new ExpressError(404,"Page not found!"));
});

//custom error handling
app.use((err,req,res,next) => {
    let{statusCode = 500, message = "something went wrong"} = err;
    res.status(statusCode).render("error.ejs",{message});
    // res.render("error.ejs",{err});
});

app.listen(8080, () => {
  console.log("app is listening to the port 8080");
});

//nmp init,express,mongoose,ejs

