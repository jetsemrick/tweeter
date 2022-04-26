const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const sessions = require('express-session');
var mysql = require('mysql');
const bcrypt = require("bcrypt");

const HTTP_PORT = 3000
const SALT_ROUND = 12;

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

// when accessing the site, check if a session has been created by looking at if there is a session username
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

  connection.query(`
  SELECT * FROM Users 
  WHERE username='${req.body.username}' 
  OR email='${req.body.username}'`, function(err, result, fields) {
    if(err) throw err;

    if(result.length == 0) {
      res.send("No account with that username/password combination exists. Please <a href='/'>go back</a> and try again.");
    } else if((result[0].username == req.body.username || result[0].email == req.body.username) && bcrypt.compareSync(req.body.password, result[0].password)) {
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
  connection.query(`
  SELECT username FROM Users 
  WHERE username='${req.body.username}' 
  OR email='${req.body.username}'`, function(err, result, fields) {
    if(err) throw err;

    // if the result is not empty, a user already exists with those parameters and the user needs to try again
    // checks lengths to match database
    if(result.length > 0) {
      res.send("Username or email already in use. Please <a href='/register'>go back</a> and try something different.");
    } else if(String(req.body.email).length > 100) {
      res.send("Email exceeds maximum length allowed. Please <a href='/register'>go back</a> and try something different.");
    } else if(String(req.body.password).length > 100) {
      res.send("Password exceeds maximum length allowed. Please <a href='/register'>go back</a> and try something different.");
    } else if(String(req.body.username).length > 12) {
      res.send("Username exceeds maximum length allowed. Please <a href='/register'>go back</a> and try something different.");
    } else {
      // otherwise, go ahead and make the insert, redirect the user to the home page to try and log in.
	  bcrypt.hash(req.body.password, SALT_ROUND).then((hash) => {
      connection.query(`
      INSERT INTO Users (username, email, password, created_on) 
      VALUES ('${req.body.username}', '${req.body.email}', '${hash}', NOW())`, function(err, result, fields) {
        if(err) throw err;

        res.send("Account created successfully! You will be redirected in 3 seconds, or <a href='/'>click here</a><script>setTimeout(() => { window.location.replace('/'); }, 3000);</script>");
      });  
	  });
    }
  });
});

app.get('/profile', (req, res) => {
  session = req.session;
  if(!session.uid) {
    res.sendFile('/www/login.html', { root :__dirname });
  } else {
    res.sendFile('/www/profile.html', { root :__dirname });
  }
});

app.get('/profile/edit', (req, res) => {
  session = req.session;
  if(!session.uid) {
    res.sendFile('/www/login.html', { root :__dirname });
  } else {
    res.sendFile('/www/edit_profile.html', { root :__dirname });
  }
});

app.get('/editProfile', (req, res) => {
  // pull tweets: SELECT post_id,post_content,post_likes,username FROM Posts INNER JOIN Users ON Posts.uid=Users.uid AND Users.uid=3
  // pull user details for card
  connection.query(`
  SELECT * FROM Users 
  WHERE username='${req.session.uid}'`, function(err, profile, fields) {
    if(err) throw err;

    res.send({
      profile: profile
    });

  });
});

app.post('/editProfile', (req, res) => {
  let pass, username, fullname, email, bio;

  console.log("Starting initial user query");

  connection.query(`
  SELECT * FROM Users 
  WHERE username='${req.session.uid}'`, function(err, result, fields) {
	if(err) throw err;

	pass = result[0].password;
	username = result[0].username;
	fullname = result[0].pref_name;
	email = result[0].email;
	bio = result[0].bio;

	console.log("Starting edit checks...");
	console.log(req.body);

	if(req.body.username != "") {

		console.log("Attempting to query username for check"); // LOGGING
		connection.query(`SELECT username FROM Users WHERE username='${req.body.username}'`, function(err, result, fields) {
			if(err) throw err;

			if(result.length > 0) {
			console.log("Username already in use"); // LOGGING
			res.send("Username already in use. Please <a href='/edit/profile'>go back</a> and try something different.");
			} else if(String(req.body.username).length > 12) {
			console.log("Username too long"); // LOGGING
			res.send("Username exceeds maximum length allowed. Please <a href='/register'>go back</a> and try something different.");
			}

			username = req.body.username;
			return;
		});
		} 
		
		if(req.body.pref_name != "") {
		if(String(req.body.pref_name).length > 20) {
			console.log("Full Name too long"); // LOGGING
			res.send("Full name exceeds maximum allowed length of 20 characters. Please <a href='/register'>go back</a> and try something different.");
		}

		fullname = req.body.pref_name;
		} 
		
		if(req.body.email != "") {
			console.log("Attempting to query email for check"); // LOGGING
			connection.query(`SELECT email FROM Users WHERE email='${req.body.email}'`, function(err, result, fields) {
				if(err) throw err;

				if(result.length > 0) {
				console.log("Email already in use"); // LOGGING
				res.send("Email already in use. Please <a href='/edit/profile'>go back</a> and try something different.");
				} else if(String(req.body.email).length > 100) {
				console.log("Email too long"); // LOGGING
				res.send("Email exceeds maximum allowed length of 100 characters. Please <a href='/register'>go back</a> and try something different.");
				}
				return
			});

			email = req.body.email;
		} 
		
		if(req.body.bio != "")
		{
			if(String(req.body.bio).length > 160) {
				res.send("Bio exceeds maximum allowed length of 160 characters. Please <a href='/register'>go back</a> and try something different.");
			}

			bio = req.body.bio;
		} 
		
		if(req.body.newPassword != "")
		{
			console.log("Starting password check") // LOGGING
			if(String(req.body.newPassword).length > 100) {
				console.log("New password too long"); // LOGGING
				res.send("Password exceeds maximum allowed length of 160 characters. Please <a href='/register'>go back</a> and try something different.");
			} else {
				console.log("Attempting to create new password"); // LOGGING
				bcrypt.hash(req.body.newPassword, SALT_ROUND).then(function(hash) {
				pass = hash;
				console.log("Created new password"); // LOGGING
				return;
				});
				console.log("Got here"); // LOGGING
			}
		} 

		fullname = fullname.replace(/'/g, "\\'");
		bio = bio.replace(/'/g, "\\'");

		console.log("Attempting query");
		connection.query(`
		UPDATE Users
		SET username = '${username}', password = '${pass}', email = '${email}', pref_name = '${fullname}', bio = '${bio}'
		WHERE username = '${req.session.uid}'`, function(err, result, fields) {
			if(err) throw err;

			console.log("Query successful");
			req.session.uid = username;
			res.redirect('/profile');
		});	
	});
});

app.get('/user', (req, res) => {
  // pull tweets: SELECT post_id,post_content,post_likes,username FROM Posts INNER JOIN Users ON Posts.uid=Users.uid AND Users.uid=3
  // pull user details for card
  connection.query(`
  SELECT * FROM Users,Posts 
  WHERE username='${req.session.uid}'`, function(err, profile, fields) {
    if(err) throw err;

    connection.query(`
    SELECT post_id,post_content,post_likes,username,pref_name,posted_on 
    FROM Posts 
    INNER JOIN Users ON Posts.uid=Users.uid 
    AND Users.uid=
      (SELECT uid from Users WHERE username='${req.session.uid}') 
    ORDER BY posted_on DESC`, function(err, tweets, fields) {
      if(err) throw err;

      res.send({
        profile: profile,
        tweets: tweets
      });
    });    
  });
});

app.post('/tweet', (req, res) => {
  connection.query(`
  INSERT INTO Posts (post_content, posted_on, uid) 
  VALUES ('${req.body.tweetBody}', NOW(), 
    (SELECT uid from Users WHERE username='${req.session.uid}')
  )`, function(err, result, fields) {
    if(err) throw err;
    res.redirect('/profile');
  });
});

// logout by destroying session and redirecting to homepage
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

app.listen(HTTP_PORT, () => console.log(`This app is listening on port ${HTTP_PORT}`));
