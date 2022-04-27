## AFCRichmond
Developed by *Nathan Dodson, Taylor Himelhoch, Jet Semrick*

Project for EECS 647 Databases. The goal of this project is to create a Twitter-like application, deemed *Tweeter*, to demonstrate database implementation.

## Installation Instructions

### Windows / Linux / MacOS:
Requires NodeJS to run. For quick installation:

1) Clone the project directory;

2) Make sure to install Node v16.14.2

3) Run the following commands in the project directory:

```
> npm install
> node server.js
```

Open `localhost:3000` in browser to access the website.

You can also navigate to our [Heroku instance](https://eecs-647-afcrichmond.herokuapp.com/) to view the production deployment.

## Tech Stack
- HTML, NodeJS
- CSS was bootstrapped with [HTML Bootstrap v5.3](https://getbootstrap.com/docs/5.1/getting-started/introduction/)
- MySQL

## To-Do

- [X] Frameworking
- [X] Implement [this](https://codeshack.io/basic-login-system-nodejs-express-mysql/) login system    
**Completion note**
    - The authentication system uses session-based cookies
    - The user is prompted to log in if their session isn't authenticated
    - If the user doesn't have an account, they can still reach the register page.
    - Otherwise, they can view the whole site like normal.
- [X] Add password hashing
- [X] User profile page
  - [X] Query for user information
  - [X] Query for user posts/comments
  - [X] Forms to update password/email
  - [X] Bio? Other information
- [X] After login, display tweets on main page
  - [X] Each tweet allows comment
  - [X] Like posts/comments
  - [X] Fix deletion (delete tweets after deleting account)

## Project Requirements

- [X] 3+ tables
  - [X] Posts
  - [X] Users
  - [X] Comments
  - Posts and users linked with FK `uid`:
  ```
  ALTER TABLE Posts ADD FOREIGN KEY (uid) REFERENCES Users(uid);
  ```
  10 selects, 1 insert, 1 join, 1 update

- [ ] 5 different (dynamic) queries
  - [ ] Users will be able to look at posts and comments by a username (join). 
  - [ ] Users can see the number of likes on a post.
  - [ ] Users can see posts from their friends.
  - [ ] Users can see their friends list.
  - [ ] Users can view the email of users who post a comment (join). 

- [X] At least 2 queries with join	
  - [X] Join post_id with comments
- [X] Database update
  - Change user password
  - Like post
- [X] Use "Session"

- [ ] Project Report
*The project report is to show what you did in the project, especially, how you designed and implemented your system. The first interim report shall include overall system design, ER diagram and (logical) database design. The final report shall include everything (introduction, design, system architecture, implementation, testing, etc.). In the final project report, you are allowed (and suggested) to reuse the contents in report 1.*


