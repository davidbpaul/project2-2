
//setting up server
const express = require("express");
const app = express();
app.set("view engine", "ejs");

//lets us to get information from post
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded());
//allow us to use put and delete
const methodOverride = require('method-override')
app.use(methodOverride('_method'));

//require database
const MongoClient = require("mongodb").MongoClient;
const MONGODB_URI = process.env.MONGODB_URI
//middleware
const connect = require('connect');

// default port 8080
const PORT = process.env.PORT || 8080;

//this project will{
//redirect home to newUrl page
//allow user to submit url
// allow user to see submitted urls
//allow user to change url
//allow user to delete url
//allow user to login
//aquire cookies for logged in user
//}

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//open port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//redirects home(/) to (/new)
app.get("/", (req, res) => {
  res.redirect('http://localhost:8080/urls/new');
});

//form post url
app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;
  let shortURL = generateRandomString();
  let re = /http/gi;
  if(longURL.search(re) == -1){
    urlDatabase[shortURL] = `http://${longURL}`;
  }else{
   urlDatabase[shortURL] = `${longURL}`;
  }
  // longurl(urlDatabase[shortURL]);
  res.redirect(`/urls/${shortURL}`)
});
//user can input a url
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let longURL = urlDatabase[req.params.id]
  let templateVars = {
    shortURL: req.params.id,
    longURL: longURL
  };
  console.log(templateVars);
  res.render("urls_show", templateVars);
});

app.get("/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL)
});

app.post("/urls/:id/delete", (req, res) =>{
  delete urlDatabase[req.params.id]
  res.redirect("/urls")
})
app.post("/urls/:id", (req, res)=>{
let longURL = req.body.longURL;
console.log(longURL)
 let shortURL = req.params.id
 let re = /http/gi;
  if(longURL.search(re) == -1){
    urlDatabase[shortURL] = `http://${longURL}`;
  }else{
   urlDatabase[shortURL] = `${longURL}`;
  }
  res.redirect(`/urls/${shortURL}`)

})

function generateRandomString() {
return Math.random().toString(36).substr(2, 6);
}



