// Installing Necessary Packages
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

// Creating express app
const app = require("express")();

//Setting up Middleware
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Setting up session cookies
app.use(
  session({
    secret: "My name is Ayush",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Accessing public Folder
app.use(express.static("public"));

// Mongodb Setup
mongoose.connect("mongodb://localhost:27017/someDB", { useNewUrlParser: true });
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const StatSchema = new mongoose.Schema({
  path: String,
  date: Number,
});

const perSessionSchema = new mongoose.Schema({
  id: String,
  date: Number,
  time: Number,
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);
const StatModel = new mongoose.model("StatModel", StatSchema);
const SessionModel = new mongoose.model("SessionModel", perSessionSchema);

// Serializing and Deserializing cookies

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Counter Variables
let homePageCounter = 0;
let videoPageCounter = 0;
let loginPageCounter = 0;
let signupPageCounter = 0;

// Setting up Routes

app.get("/", (req, res) => {
  totalPageViews++;

  // Under Progress
  homePageCounter++;
  res.render("home", { homePageCounter: homePageCounter });
});

app.get("/videos", (req, res) => {
  totalPageViews++;

  // Under Progress
  videoPageCounter++;
  res.render("videos", { videoPageCounter: videoPageCounter });
});

app.get("/signup", (req, res) => {
  totalPageViews++;

  // Under Progress
  signupPageCounter++;
  res.render("signup", { signupPageCounter: signupPageCounter });
});

app.get("/login", (req, res) => {
  totalPageViews++;

  //Under Progress
  loginPageCounter++;
  res.render("login", { loginPageCounter: loginPageCounter });
});

app.get("/logout", (req, res) => {
  res.redirect("/");
});

// Saving unique user count
let count = User.countDocuments({}, (err, User) => {
  if (err) {
    console.log(err);
  } else {
    count = User;
  }
});

async () => {
  await count.save().then(console.log("Saved"));
};

let totalPageViews = 0;
app.post("/recordPageView", async (req, res) => {
  try {
    let { path, firstTimeUser } = req.body;

    // if (firstTimeUser) {
    //   find document from mongo and increse unique user count by 1 and save back
    //   let count = User.countDocuments({}, (err, User) => {
    //     if (err) {
    //       console.log(err);
    //     } else {
    //       count = User;
    //     }
    //   });
    // }

    const pathData = new StatModel({ path, date: new Date() });
    async () => {
      await pathData.save();
    };
    res.send({ success: true });
  } catch (error) {
    res.send({ success: false, error });
  }
});

app.post("/signup", (req, res) => {
  User.register(
    { username: req.body.username },
    req.body.password,
    (err, user) => {
      if (err) {
        console.log(err);
        res.redirect("/signup");
      } else {
        passport.authenticate("local")(req, res, () => {
          count++;
          res.redirect("/login");
        });
      }
    }
  );
});

app.get("/analytics", (req, res) => {
  totalPageViews++;
  res.render("analytics", {
    count: count,
    totalPageViews: totalPageViews,
  });
});

let userSessionId = null;
app.post("/login", (req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });
  req.login(user, (err) => {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, () => {
        if (req.isAuthenticated()) {
          console.log("User is Authenticated");
          let userSessionId = req.sessionID;
          console.log(userSessionId);

          const userSessionSave = new SessionModel({
            id: userSessionId,
            date: new Date().getDate(),
            time: new Date().getTime(),
          });
          async () => {
            await userSessionSave.save().then(console.log(userSessionSave));
          };
          res.redirect("/analytics");
        }
      });
    }
  });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server Started on Port 3000");
});
