const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

//1-signup
router.get("/signup",(req,res) => {
    res.render("users/signup.ejs");
});

router.post("/signup", wrapAsync(async(req,res) => {
   try{
        let {username,email,password} = req.body;//extrct this from users body
    const newUser = new User({email,username});
    //".register" is used to register the user in DB
    const registeredUser = await User.register(newUser,password);
    console.log(registeredUser);
    // passport.authenticate() middleware invokes req.login() automatically. This function is primarily used when users sign up, during which req.login() can be invoked to automatically login the newly registered user
    req.login(registeredUser, (err) => {
      if(err) {
        return next(err);
      }
      req.flash("success","welcome to wanderlust");
      res.redirect("/listings");
    });
  }catch(err){
    req.flash("error",err.message);
    res.redirect("/signup");
  }
})
);

//2-Login
router.get("/login", (req,res) => {
    res.render("users/login.ejs");
});
 //Passport provides an authenticate() function, which is used as a route middleware to authenticate requests.
router.post("/login",saveRedirectUrl,passport.authenticate("local",{failureRedirect: '/login', failureFlash: true}), async(req,res) => {
    req.flash("success","welcome to wanderlust");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);//define in middleware.js
});

//3-loggedout
router.get("/logout", (req,res) => {
  req.logout((err) => {
    if(err) {
      return next(err);
    }
    req.flash("success", "you are logged out!");
    res.redirect("/listings");
  });
});

module.exports = router;
