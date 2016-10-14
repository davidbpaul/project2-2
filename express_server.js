
//setting up server
const express = require("express");
const app = express();
app.set("view engine", "ejs");

//lets us to get information from post
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended:false}));
//allow us to use put and delete
const methodOverride = require('method-override')
app.use(methodOverride('_method'));

//allows for cookies
const cookieParser = require('cookie-parser')
app.use(cookieParser())

//security
const bcrypt = require('bcrypt-nodejs');
//cookie security
const cookieSession = require('cookie-session')
app.use(cookieSession({
 keys: ['user_id']
}))

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

//databases:
const urlDatabase = {
  "b2xVn2": {user: undefined, url: "http://www.lighthouselabs.ca"},
  "9sm5xK": {user: undefined, url: "http://www.google.com"}
}
const home = {
}
const users = {
  "userRandomID":{id: "userRandomID", email: "user@example.com", password: "purple-monkey-dinosaur"},
  "user2RandomID":{id: "user2RandomID", email: "user2@example.com", password: "dishwasher-funk"}
}

//open port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//redirects home(/) to (/new)
app.get("/", (req, res) => {
  res.redirect('http://localhost:8080/urls/new');
});

//user can input a url
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.session.user_id,
    user: user(req.session.user_id)
  };
  res.render("urlS_new", templateVars);
});

//form post url
app.post("/urls", (req, res) => {
  if(loggedin(req.session.user_id)){
    const longURL = req.body.longURL;
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {user: '...', url: 'http://example.com'};
    const re = /http/gi;
    if(longURL.search(re) == -1){
      urlDatabase[shortURL].user = req.session.user_id
      urlDatabase[shortURL].url = `http://${longURL}`;
      console.log(urlDatabase[shortURL].user)
      console.log(urlDatabase[shortURL].url)
    }else{
     urlDatabase[shortURL].user = req.session.user_id
     urlDatabase[shortURL].url = `${longURL}`;
    }
    return res.redirect(`/urls/${shortURL}`)
  }else{
    res.status(403);
    res.send('log in to make a post')
  }
});

//load /urls
app.get("/urls", (req, res) => {
  const templateVars = {
    username: req.session.user_id,
    user: user(req.session.user_id),
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

//update
app.post("/urls/:id", (req, res)=>{
  let longURL = req.body.longURL;
  let shortURL = req.params.id
  if(req.session.user_id === urlDatabase[shortURL].user){
    let re = /http/gi;
    if(longURL.search(re) == -1){
      urlDatabase[shortURL].user = req.session.user_id
      urlDatabase[shortURL].url = `http://${longURL}`;
    }else{
    urlDatabase[shortURL].user = req.session.user_id
    urlDatabase[shortURL].url = `${longURL}`;
  }
  return res.redirect(`/urls/${shortURL}`)
  }else{
    res.status(403);
    res.send('unauthorized access')
  }
})

//delete
app.post("/urls/:id/delete", (req, res) =>{
  const delt = req.params.id;
  if(req.session.user_id === urlDatabase[delt].user){
    delete urlDatabase[req.params.id]
    delete home[req.params.id]
    res.redirect("/urls")
  }else{
    res.status(403);
    res.send('unauthorized access')
  }
})

// load specific url
app.get("/urls/:id", (req, res) => {
  console.log('hey')
  const longURL = urlDatabase[req.params.id]
  const templateVars = {
    username: req.session.user_id,
    user: user(req.session.user_id),
    shortURL: req.params.id,
    longURL: longURL
  };
  res.render("urls_show", templateVars);
});

//users post
app.get('/home', (req, res) =>{
  let id = req.session.user_id
  for(var nUser in urlDatabase) {
    let shortURL = urlDatabase[nUser]
    let longURL = urlDatabase[nUser].url
    let person = urlDatabase[nUser].user
    if(person === id){
      home[nUser] = {user: '...', url: 'http://example.com'}
      home[nUser].user = req.session.user_id
      home[nUser].url = `${longURL}`;
    }
  }
  const tUser = user(req.session.user_id)
  const templateVars = {
    username: req.session.user_id,
    user: tUser,
    urls: home
  };
  res.render("ho", templateVars)
})

//login form
app.post("/login", (req, res)=>{
  const logemail = req.body.email
  const logpassword = req.body.password
  for(key in users){
    const user = users[key].email
    const pass =  users[key].password
    const cook = users[key].id
    if(logemail === user && bcrypt.compareSync(logpassword, pass)){
      req.session.user_id = cook
      res.redirect("/")
    }
  }
  res.status(403);
  res.send('username or password does not match')
})

//logout
app.post("/logout", (req, res)=>{
  req.session = null
  res.redirect("/")
})

//render login
app.get('/login', (req, res) => {
  res.render("log");
})

//registration form
app.post('/register', (req, res)=>{
  const email = req.body.email
  const hashed_password = bcrypt.hashSync(req.body.password)
  for(key in users){
    const user = users[key].email
    if(user === email){
    res.status(400);
    res.send('username taken');
    }
  }
  if(email === '' || bcrypt.compareSync('', hashed_password)){
    res.status(400);
    res.send('missing information');
  }else{
    let id = generateRandomString()

    users[id] = id;
    users[id] = {id: id,
                 email: email,
                 password: hashed_password
                }
    req.session.user_id = id
    res.redirect('/')
  };
});

//render register page
app.get('/register', (req, res) => {
  res.render("reg");
});

//render page not found
app.get('/url-not-found', (req, res) => {
  res.render('not-found');
});

//bring user to longurl website
app.get("/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if(longURL){
    return res.redirect(longURL.url);
  }
  return res.redirect('/url-not-found');
});

//generate key
function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}

//checks if logged in
function loggedin(cookie){
  if (cookie){
    return true
  }
}

//return email if logged in
function user(cookie){
  for(key in users){
    let cook = users[key].id
    let email = users[key].email
    if(cook === cookie ){
      return email;
    }
  }
}
