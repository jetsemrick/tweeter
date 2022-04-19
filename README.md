## AFCRichmond
Developed by *Nathan Dodson, Taylor Himelhoch, Jet Semrick*

Project for EECS 647 Databases. The goal of this project is to create a Twitter-like application to demonstrate database implementation.

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
- [ ] Add password hashing
- [ ] User profile page
- [ ] After login, display tweets on main page


