//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const https = require("https");
const mongoose = require("mongoose");
const assert = require("assert");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const { count } = require('console');



const app = require('express')();



app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));


app.use(session({
  secret: "My name is Ayush",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());


app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});
mongoose.set("useCreateIndex", true)

const userSchema = new mongoose.Schema ({
  email: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);


const User = new mongoose.model("User", userSchema);


// Function for user count
 
  User.find().exec(function (err, results) {
  var count = results.length
  console.log(count); 
});



passport.use(User.createStrategy());

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.get("/", function(req, res){
  res.render("home");
});

app.get("/about", function(req, res){
  res.render("about");
});

app.get("/videos", function(req, res){
  res.render("videos");
});

app.get("/login", function(req, res) {
  res.render("login");
})

app.get("/signup", function(req, res){
  res.render("signup");
});

app.get("/analytics", function(req, res) {
  if (req.isAuthenticated()) {
    res.render("analytics", {count: count});
  } else {
    res.redirect("/login");
  }
})

app.get("/logout",(req, res) => {
  req.logout();
  res.redirect("/");
})



app.post("/signup", (req, res) => {
  
  User.register({username: req.body.username}, req.body.password, (err, user) => {
    if (err) {
      console.log(err);
      res.redirect("/signup");
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/login");
      })
    }
  })
   
  })


  
 


app.post("/login", function(req, res) {
   const user = new User({
     username: req.body.username,
     password: req.body.password
   });

   req.login(user, function(err){
     if (err) {
       console.log(err);
     } else {
       passport.authenticate("local")(req, res, () => {
         res.redirect("/analytics")
       })
     }
   })

})







app.listen( process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
