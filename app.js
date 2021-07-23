//jshint esversion:6

require('dotenv').config(); //environment variables are safe now 😁
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

app.use(express.static("public"));
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));

mongoose.connect("mongodb://localhost:27017/userDB",{useUnifiedTopology: true,useNewUrlParser: true ,useFindAndModify:false});

const userSchema = new mongoose.Schema ({
  email: String,
  password: String
});


userSchema.plugin(encrypt, { secret: process.env.SECRETS,encryptedFields: ["password"] }); //add this plugin before creating the mongoose model

const User = new mongoose.model("User",userSchema);

app.get("/",(req,res)=>{
  res.render("home");
});

app.get("/login",(req,res)=>{
  res.render("login");
});

app.get("/register",(req,res)=>{
  res.render("register");
});

app.post("/register",(req,res)=>{
  const newUser = new User({
    email:req.body.username,
    password:req.body.password
  });
  newUser.save((err)=>{
    if(err){
      console.log(err);
    }else{
      res.render("secrets");
    }
  });
});

app.post("/login", function(req, res) {
  const username = req.body.username
  const password = req.body.password

  User.findOne({email: username}, function(err, foundUser){
    if(foundUser){
      if(foundUser.password === password) {
        res.render("secrets")
      } else if(foundUser.password != password) {
        res.send("The password is incorrect.")
      }
    } else if (!foundUser) {
      res.send("No registered user found.")
    }
  })
})


app.listen(3000,()=>{
  console.log("Server started on port 3000");
});
