//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");

const mongoose = require("mongoose");

const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";



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

const StatSchema = mongoose.Schema({
  name: {
      type: String,
  },
  count: {
      type: Number,
  }
  
});





userSchema.plugin(passportLocalMongoose);


const User = new mongoose.model("User", userSchema, "userDB");
const Stat = new mongoose.model("Stat", StatSchema, "userDB");



// Stat.insertOne(myObject, function(err, res) {
//   if (err) throw err;
//   console.log("1 document inserted");
// });

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("userDB");
  var myObject = {"name" : "counter", "count" : 0};
  dbo.collection("Stat").insertOne(myObject, function(err, res) {
    if (err){
      console.log(err);
    }  else {
      console.log("1 document inserted");
    }
  });
});

// Function for user count
 
 
 // let  count1 = 0;
  

//   User.find().exec(function (err, results) {
//    count = results.length
//   console.log(count); 
// });



// User.countDocuments({}, (err, users) => {
//   count1 = users
//   console.log(count1);
// })


let count1 = User.countDocuments({}, (err, users) => {
     count1 = users
     console.log(count1);
    })







passport.use(User.createStrategy());

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.get("/", function(req, res){
  Stat.findOneAndUpdate({name: "counter"}, { $inc: { count: 1 }}, function(err, counter) {
    if (err) throw err;
    if(!counter){
       res.render('home');
    }
    else{
      res.render('home', {counter: counter.count});
    }
 });
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
 res.render("signup")
});


app.get("/logout",(req, res) => {
  req.logout();
  res.redirect("/");

})

app.get("/analytics", function(req, res) {
 
res.render("analytics", {count1: count1})
})





app.post("/signup", (req, res) => {
  
  User.register({username: req.body.username}, req.body.password, (err, user) => {
    if (err) {
      console.log(err);
      res.redirect("/signup");
    } else {
      passport.authenticate("local")(req, res, function(){
        count1++
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







app.listen(process.env.PORT || 3000, () => {

    console.log("Server Started on Port 3000");
  
})
