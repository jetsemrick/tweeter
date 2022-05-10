const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const sessions = require('express-session');
const bcrypt = require('bcrypt');
var mysql = require('mysql');
const { query } = require('express');

const HTTP_PORT = process.env.PORT || 3000;
const SALT_ROUND = 12;

var session;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// sessions
// session last one day
app.use(
	sessions({
		secret:
			'hBnOe8tMP0UrjkBAk4GfnTG72prbMay4CEZoEYoaeALAowHO3DBLBGSScNPWZdak',
		saveUninitialized: true,
		cookie: { maxAge: 1000 * 60 * 60 * 24 },
		resave: false,
	})
);

// MySQL Connections
let connection = mysql.createPool({
	host: 'mysql.eecs.ku.edu',
	user: 'n791d901',
	password: 'feos9Ahd',
	database: 'n791d901',
	multipleStatements: true,
});

// ROUTES
// --------------------------------
// serve static files on HTTP requests
app.use(express.static(__dirname));

// when accessing the site, check if a session has been created by looking at if there is a session username
app.get('/', (req, res) => {
	session = req.session;
	if (!session.uid) {
		res.sendFile('/www/login.html', { root: __dirname });
	} else {
		res.sendFile('/www/index.html', { root: __dirname });
	}
});

// serve signup page (does not require login)
app.get('/register', (req, res) => {
	res.sendFile('/www/signup.html', { root: __dirname });
});

app.get('/profile', (req, res) => {
	session = req.session;
	if (!session.uid) {
		res.sendFile('/www/login.html', { root: __dirname });
	} else {
		res.sendFile('/www/profile.html', { root: __dirname });
	}
});

app.get('/profile/edit', (req, res) => {
	session = req.session;
	if (!session.uid) {
		res.sendFile('/www/login.html', { root: __dirname });
	} else {
		res.sendFile('/www/edit_profile.html', { root: __dirname });
	}
});

app.get('/post*', (req, res) => {
	session = req.session;
	if (!session.uid) {
		res.sendFile('/www/login.html', { root: __dirname });
	} else {
		res.sendFile('/www/post.html', { root: __dirname });
	}
});
// --------------------------------

// API HANDLERS
// --------------------------------
// All of the individual API endpoints that make requests to the DB

// login POST handling. When the form is submitted in the static html file it will try to post to this method.
// database logic will go in here to check for a created user already
app.post('/login', async (req, res) => {
	connection.query(
		`
	SELECT * FROM Users 
	WHERE username='${req.body.username}' 
	OR email='${req.body.username}'
	`,
		function(err, result, fields) {
			if (err) throw err;

			if (result.length == 0) {
				res.send(
					"No account with that username/password combination exists. Please <a href='/'>go back</a> and try again."
				);
			} else if (
				(result[0].username == req.body.username ||
					result[0].email == req.body.username) &&
				bcrypt.compareSync(req.body.password, result[0].password)
			) {
				session = req.session;
				session.uid = req.body.username;

				res.redirect('/');
			} else {
				res.send(
					"No account with that username/password combination exists. Please <a href='/'>go back</a> and try again."
				);
			}
		}
	);
});

// Registration handler. Will verfiy that the input fields match the requirements of the database fields
app.post('/register', async (req, res) => {
	// make initial query to check if a user with that uname/email exists
	connection.query(
		`
  SELECT username FROM Users 
  WHERE username='${req.body.username}' 
  OR email='${req.body.username}'`,
		function(err, result, fields) {
			if (err) throw err;

			// if the result is not empty, a user already exists with those parameters and the user needs to try again
			// checks lengths to match database
			if (result.length > 0) {
				res.send(
					"Username or email already in use. Please <a href='/register'>go back</a> and try something different."
				);
			} else if (String(req.body.email).length > 100) {
				res.send(
					"Email exceeds maximum length allowed. Please <a href='/register'>go back</a> and try something different."
				);
			} else if (String(req.body.password).length > 100) {
				res.send(
					"Password exceeds maximum length allowed. Please <a href='/register'>go back</a> and try something different."
				);
			} else if (String(req.body.username).length > 12) {
				res.send(
					"Username exceeds maximum length allowed. Please <a href='/register'>go back</a> and try something different."
				);
			} else {
				// otherwise, go ahead and make the insert, redirect the user to the home page to try and log in.
				bcrypt.hash(req.body.password, SALT_ROUND).then((hash) => {
					connection.query(
						`
						INSERT INTO Users (username, email, password, created_on) 
						VALUES ('${req.body.username}', '${req.body.email}', '${hash}', NOW())`,
						function(err, result, fields) {
							if (err) throw err;

							res.send(
								"Account created successfully! You will be redirected in 3 seconds, or <a href='/'>click here</a><script>setTimeout(() => { window.location.replace('/'); }, 3000);</script>"
							);
						}
					);
				});
			}
		}
	);
});

// Feed handler. Will retrieve all posts from all users and order them by most recently posted.
app.get('/feed', (req, res) => {
	if (!req.session.uid) {
		res.sendFile('/www/login.html', { root: __dirname });
	} else {
		connection.query(
			`SELECT post_id,Posts.post_content,Posts.post_likes,Users.username,Users.pref_name,Posts.posted_on 
		FROM Posts
		JOIN Users ON Users.uid = Posts.uid
		ORDER BY posted_on DESC
	  	`,
			function(err, feed, fields) {
				if (err) throw err;
				if (feed.length == 0) {
					res.send('No posts found.');
				} else {
					res.send({
						feed: feed,
					});
				}
			}
		);
	}
});

// GET edit profile handler. Used to get current profile information for comparison before changing aspects of the user profile.
app.get('/editProfile', (req, res) => {
	if (!req.session.uid) {
		res.sendFile('/www/login.html', { root: __dirname });
	} else {
		// pull tweets: SELECT post_id,post_content,post_likes,username FROM Posts INNER JOIN Users ON Posts.uid=Users.uid AND Users.uid=3
		// pull user details for card
		connection.query(
			`
		SELECT * FROM Users 
		WHERE username='${req.session.uid}'`,
			function(err, profile, fields) {
				if (err) throw err;

				res.send({
					profile: profile,
				});
			}
		);
	}
});

// Large POST request to handle errors, compare new/old passwords, etc.
app.post('/editProfile', (req, res) => {
	if (!req.session.uid) {
		res.sendFile('/www/login.html', { root: __dirname });
	} else {
		let pass, username, fullname, email, bio;
		let errors = '';

		console.log('Starting initial user query'); // LOGGING

		connection.getConnection(function(err, conn) {
			conn.query(
				`
				SELECT * FROM Users 
				WHERE username='${req.session.uid}';
				SELECT username FROM Users WHERE username='${req.body.username}';
				SELECT email FROM Users 
				WHERE email='${req.body.email}';`,
				[1, 2, 3],
				function(err, result, fields) {
					if (err) throw err;

					pass = result[0][0].password;
					if (!bcrypt.compareSync(req.body.password, pass))
						errors +=
							"Incorrect password. Please <a href='/profile/edit'>go back</a> and try something different.";

					username = result[0][0].username;
					fullname = result[0][0].pref_name;
					email = result[0][0].email;
					bio = result[0][0].bio;

					console.log('Starting edit checks...'); // LOGGING

					if (req.body.username != '' && errors == '') {
						console.log('Attempting to query username for check'); // LOGGING

						if (result[1].length > 0) {
							console.log('Username already in use'); // LOGGING
							errors +=
								"Username already in use. Please <a href='/profile/edit'>go back</a> and try something different.";
						} else if (String(req.body.username).length > 12) {
							console.log('Username too long'); // LOGGING
							errors +=
								"Username exceeds maximum length allowed. Please <a href='/register'>go back</a> and try something different.";
						} else {
							username = req.body.username;
						}
					}

					if (req.body.pref_name != '' && errors == '') {
						if (String(req.body.pref_name).length > 20) {
							console.log('Full Name too long'); // LOGGING
							errors +=
								"Full name exceeds maximum allowed length of 20 characters. Please <a href='/register'>go back</a> and try something different.";
						} else {
							fullname = req.body.pref_name;
						}
					}

					if (req.body.email != '' && errors == '') {
						console.log('Attempting to query email for check'); // LOGGING

						if (result[2].length > 0) {
							console.log('Email already in use'); // LOGGING
							errors +=
								"Email already in use. Please <a href='/profile/edit'>go back</a> and try something different.";
						} else if (String(req.body.email).length > 100) {
							console.log('Email too long'); // LOGGING
							errors +=
								"Email exceeds maximum allowed length of 100 characters. Please <a href='/register'>go back</a> and try something different.";
						} else {
							email = req.body.email;
						}
					}

					if (req.body.bio != '' && errors == '') {
						if (String(req.body.bio).length > 160) {
							errors +=
								"Bio exceeds maximum allowed length of 160 characters. Please <a href='/register'>go back</a> and try something different.";
						} else {
							bio = req.body.bio;
						}
					}

					if (req.body.newPassword != '' && errors == '') {
						console.log('Starting password check'); // LOGGING

						if (String(req.body.newPassword).length > 100) {
							console.log('New password too long'); // LOGGING
							errors +=
								"Password exceeds maximum allowed length of 160 characters. Please <a href='/register'>go back</a> and try something different.";
						} else {
							console.log('Attempting to create new password'); // LOGGING
							bcrypt
								.hash(req.body.newPassword, SALT_ROUND)
								.then(function(hash) {
									pass = hash;
									console.log('Created new password'); // LOGGING
									return;
								});
						}
					}

					if (errors == '') {
						if (fullname != undefined)
							fullname = fullname.replace(/'/g, "\\'");

						if (bio != undefined) bio = bio.replace(/'/g, "\\'");

						console.log('Attempting query');
						connection.query(
							`
							UPDATE Users
							SET username = '${username}', password = '${pass}', email = '${email}', pref_name = '${fullname}', bio = '${bio}'
							WHERE username = '${req.session.uid}'`,
							function(err) {
								if (err) throw err;

								console.log('Query successful');
								req.session.uid = username;
								res.redirect('/profile');
							}
						);
					} else {
						console.log('Errors detected. Not updating DB.');
						res.send(errors);
					}
				}
			);
		});
	}
});

// Gets user information and tweets
app.get('/user', (req, res) => {
	if (!req.session.uid) {
		res.sendFile('/www/login.html', { root: __dirname });
	} else {
		// pull tweets: SELECT post_id,post_content,post_likes,username FROM Posts INNER JOIN Users ON Posts.uid=Users.uid AND Users.uid=3
		// pull user details for card
		connection.query(
			`
		SELECT * FROM Users 
		WHERE username='${req.session.uid}'`,
			function(err, profile, fields) {
				if (err) throw err;

				connection.query(
					`
			SELECT post_id,post_content,post_likes,username,pref_name,posted_on 
			FROM Posts 
			INNER JOIN Users ON Posts.uid=Users.uid 
			AND Users.uid=
			(SELECT uid from Users WHERE username='${req.session.uid}') 
			ORDER BY posted_on DESC`,
					function(err, tweets, fields) {
						if (err) throw err;
						res.send({
							profile: profile,
							tweets: tweets,
						});
					}
				);
			}
		);
	}
});

// Gets post and comments on that post.
app.get('/getPost', (req, res) => {
	if (!req.session.uid) {
		res.sendFile('/www/login.html', { root: __dirname });
	} else {
		connection.query(
			`
		SELECT post_id,post_content,post_likes,username,pref_name,posted_on 
		FROM Posts,Users 
		WHERE post_id='${req.query.pid}'
		AND Posts.uid=Users.uid`,
			function(err, post, fields) {
				if (err) throw err;
				connection.query(
					`
				SELECT comment_id,comment_content,posted_on,username,pref_name 
				FROM Users,(SELECT comment_id,comment_content,Comments.posted_on FROM Comments
				JOIN Posts ON Comments.post_id=Posts.post_id 
				AND Comments.post_id='${req.query.pid}') AS com
				WHERE username IN (SELECT username from Users,Comments WHERE Users.uid=Comments.uid)
				ORDER BY posted_on DESC
					`,
					function(err, comments, fields) {
						if (err) throw err;
						res.send({
							post: post,
							comments: comments,
						});
					}
				);
			}
		);
	}
});

// POSTs comment on post.
app.post('/comment', (req, res) => {
	if (!req.session.uid) {
		res.sendFile('/www/login.html', { root: __dirname });
	} else {
		connection.query(
			`
			INSERT INTO Comments (comment_content, posted_on, post_id, uid) 
			VALUES ('${req.body.commentBody}', NOW(), '${req.body.pid}', 
				(SELECT uid from Users WHERE username='${req.session.uid}')
			)`,
			function(err) {
				if (err) throw err;
				res.redirect('/post?pid=' + req.body.pid);
			}
		);
	}
});

// Makes Tweet POST
app.post('/tweet', (req, res) => {
	if (!req.session.uid) {
		res.sendFile('/www/login.html', { root: __dirname });
	} else {
		connection.query(
			`
			INSERT INTO Posts (post_content, posted_on, uid) 
			VALUES ('${req.body.tweetBody}', NOW(), 
				(SELECT uid from Users WHERE username='${req.session.uid}')
			)`,
			function(err, result, fields) {
				if (err) throw err;
				res.redirect('/profile');
			}
		);
	}
});

// Likes a Post
app.get('/like', (req, res) => {
	if (!req.session.uid) {
		res.sendFile('/www/login.html', { root: __dirname });
	} else {
		connection.query(
			`
			UPDATE Posts 
			SET post_likes = post_likes + 1
			WHERE Posts.post_id="${req.query.pid}"
			`,
			function(err) {
				if (err) throw err;
				res.redirect(req.get('referer'));
			}
		);
	}
});

// Delete account and associated tweets.
app.post('/deleteAccount', (req, res) => {
	if (!req.session.uid) {
		res.sendFile('/www/login.html', { root: __dirname });
	} else {
		connection.query(
			`DELETE FROM Posts
			WHERE uid=(SELECT uid from Users WHERE username='${req.session.uid}')`,
			function(err) {
				if (err) throw err;
				connection.query(
					`
			DELETE FROM Users
			WHERE username='${req.session.uid}'`,
					function(err) {
						if (err) throw err;
						req.session.destroy();
						res.redirect('/');
					}
				);
			}
		);
	}
});

// logout by destroying session and redirecting to homepage
app.get('/logout', (req, res) => {
	req.session.destroy();
	res.redirect('/');
});

app.listen(HTTP_PORT, () =>
	console.log(`This app is listening on port ${HTTP_PORT}`)
);
