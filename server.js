const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const sessions = require('express-session');
var mysql = require('mysql');
const bcrypt = require("bcrypt");

const HTTP_PORT = 3000

var session;

app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

// sessions
// session last one day
app.use(sessions({
    secret: "hBnOe8tMP0UrjkBAk4GfnTG72prbMay4CEZoEYoaeALAowHO3DBLBGSScNPWZdak",
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
    resave: false 
}));

// MySQL Connections
let connection = mysql.createConnection({
  host: "mysql.eecs.ku.edu",
  user: "n791d901",
  password: "feos9Ahd",
  database: "n791d901"
});

// Routes
// serve static files
app.use(express.static(__dirname));

// when accessing the site, check if a session has been created by looking at if there is a session userid
app.get('/', (req, res) => {
  session = req.session;
  if(!session.uid) {
    res.sendFile('/www/login.html', { root :__dirname });
  } else {
    res.sendFile('/www/index.html', { root :__dirname });
  }
});

// login POST handling. When the form is submitted in the static html file it will try to post to this method.
// database logic will go in here to check for a created user already
app.post('/login', async (req, res) => {

  connection.query("SELECT * FROM Users WHERE userid='" + req.body.username + "' OR email='" + req.body.username + "'", function(err, result, fields) {
    if(err) throw err;

    if(result.length == 0) {
      res.send("No account with that username/password combination exists. Please <a href='/'>go back</a> and try again.");
    } else if((result[0].userid == req.body.username || result[0].email == req.body.username) && bcrypt.compareSync(req.body.password, result[0].password)) {
      session = req.session;
      session.uid = req.body.username;
      
      res.redirect('/');  
    } else {
      res.send("No account with that username/password combination exists. Please <a href='/'>go back</a> and try again.");
    }
  });
});

app.get('/register', (req, res) => {
  res.sendFile('/www/signup.html', { root :__dirname });
});

app.post('/register', async (req, res) => {
  // make initial query to check if a user with that uname/email exists
  connection.query("SELECT userid FROM Users WHERE userid='" + req.body.username + "' OR email='" + req.body.email + "'", function(err, result, fields) {
    if(err) throw err;

    // if the result is not empty, a user already exists with those parameters and the user needs to try again
    if(result.length > 0) {
      res.send("Username or email already in use. Please <a href='/register'>go back</a> and try something different.");
    } else {
      // otherwise, go ahead and make the insert, redirect the user to the home page to try and log in.
	  const saltRound = 12;
	  const hash = bcrypt.hash(req.body.password, saltRound).then((hash) => {
		connection.query("INSERT INTO Users (userid, email, password) VALUES ('" + req.body.username + "','" + req.body.email + "','" + hash + "')", function(err, result, fields) {
			if(err) throw err;
			res.send("Account created successfully! You will be redirected in 3 seconds, or <a href='/'>click here</a><script>setTimeout(() => { window.location.replace('/'); }, 3000);</script>");
			// setTimeout(() => { res.redirect('/'); }, 3000);
		  });  
	  });
    }
  });
});

app.get('/profile', (req, res) => {
	res.sendFile('/www/profile.html', { root :__dirname });
  });

// logout by destroying session and redirecting to homepage
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

app.listen(HTTP_PORT, () => console.log(`This app is listening on port ${HTTP_PORT}`));
