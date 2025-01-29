const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/expressError.js");
const session = require("express-session");
const flash = require("connect-flash");

const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");

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

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended : true}));
app.use(methodOverride("_method"));
// app.engine('ejs', engine);
//or
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

//session - npm i express-session , flash - npm i connect-flash
const sessionOptions = {
    secret : "mysupersecretcode",
    resave : false,
    saveUninitialzied : true,
    cookie : {
    //if we set cookie expired within a week    
        //presentDate + daysIn1week*hoursIn1day*minIn1hour*secIn1min*miliSecIn1sec
        expires : Date.now() + 7 * 24 * 60 * 60 * 1000,//these are 1 week miliSeconds
        maxAge : 7 * 24 * 60 * 60 * 1000,
        httpOnly : true,
    }
};

app.get("/", (req,res) => {
    res.send("Hi I am Iphat");
});

app.use(session(sessionOptions));
app.use(flash());

app.use((req,res,next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    console.log(res.locals.success);
    next();
});
//use flash before the routes required
app.use("/listings",listings);
app.use("/listings/:id/reviews",reviews);


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
