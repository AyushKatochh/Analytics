//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const https = require("https");
const dotEnv = require('dotenv').config();




const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

let posts = [];

app.get("/", function(req, res){
  res.render("home");
});

app.get("/about", function(req, res){
  res.render("about");
});

app.get("/videos", function(req, res){
  res.render("videos");
});

app.get("/analytics", function(req, res) {
  res.render("analytics");
})

app.get("/signup", function(req, res){
  res.render("signup");
});



app.post("/", function(req, res){
  const firstName = req.body.fName;
  const lastName = req.body.lName;
  const email = req.body.email;

  const data = {
      members: [
          {
            email_address: email,
            status: "subscribed",
            merge_fields: {
                FNAME: firstName,
                LNAME: lastName
            }
          }
      ]
  };

  const jsonData = JSON.stringify(data);

  const url = "https://us17.api.mailchimp.com/3.0/lists/e83041e054";

  const options = {
      method: "POST",
      auth: process.env.API_KEY
  }

 const request =  https.request(url, options, function(response){

     if (response.statusCode === 200) {
     
        res.render("success", {aboutContent: aboutContent});
      
     } else {
     
        res.render("failure", {aboutContent: aboutContent});
    
     }

         response.on("data", function(data){
             console.log(JSON.parse(data));
         })
  })
  request.write(jsonData);
request.end();

});



app.listen( process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
