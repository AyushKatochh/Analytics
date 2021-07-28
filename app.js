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
mongoose.connect("mongodb://localhost:27017/myDB", { useNewUrlParser: true });
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
const StatModel = new mongoose.model("Stat", StatSchema);
const SessionModel = new mongoose.model("SessionModel", perSessionSchema);

// Serializing and Deserializing cookies

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Setting up Routes

app.get("/", (req, res) => {
  totalPageViews++;
  res.render("home");
});

app.get("/videos", (req, res) => {
  totalPageViews++;
  res.render("videos");
});

app.get("/signup", (req, res) => {
  totalPageViews++;
  res.render("signup");
});

app.get("/login", (req, res) => {
  totalPageViews++;
  res.render("login");
});

app.get("/logout", (req, res) => {
  res.redirect("/");
});

let count = 0;
let totalPageViews = 0;
app.post("/recordPageView", async (req, res) => {
  try {
    let { path, firstTimeUser } = req.body;

    if (firstTimeUser) {
      // find document from mongo and increse unique user count by 1 and save back
      let count = User.countDocuments({}, (err, users) => {
        if (err) {
          console.log(err);
        } else {
          count = users;
        }
      });
    }

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

async () => {
  await count.save();
  console.log(count);
};

app.get("/analytics", (req, res) => {
  totalPageViews++;
  res.render("analytics", {
    count: count,
    totalPageViews: totalPageViews,
  });
});

let userSessionId = "";
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
        res.redirect("/analytics");
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
            await userSessionSave
              .save()
              .then(console.log("user id, date and time are saved"));
          };
          res.send({ success: true });
        }
      });
    }
  });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server Started on Port 3000");
});
