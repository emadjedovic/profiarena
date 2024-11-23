const express = require("express");
const layouts = require("express-ejs-layouts");
const methodOverride = require("method-override");
const bcrypt = require("bcrypt");
const expressSession = require("express-session");
const cookieParser = require("cookie-parser");
const connectFlash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const favicon = require('serve-favicon');
const path = require('path');
const { client } = require("./db/db_connect"); // Import the client from db_connect.js

const app = express();

// Serve the favicon
app.use(favicon(path.join(__dirname, 'public', 'favicon2.ico')));

// MIDDLEWARE
app.use(express.static("public"));
app.use(layouts);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(
  methodOverride("_method", {
    methods: ["POST", "GET"],
  })
);
app.use(cookieParser("secret_passcode"));
app.use(
  expressSession({
    secret: "secret_passcode",
    cookie: {
      maxAge: 4000000,
    },
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(connectFlash());
app.use((req, res, next) => {
  res.locals.flashMessages = req.flash();
  res.locals.loggedIn = req.isAuthenticated();
  res.locals.currentUser = req.user;
  res.locals.token = req.session.token;
  res.locals.currentPath = req.path;
  next();
});

const checkLoginStatus = (req, res, next) => {
  if (req.user) {
    // User is logged in, redirect to /home if they try to visit /login or /register
    if (req.originalUrl === '/' || req.originalUrl === '/login' || req.originalUrl === '/register') {
      return res.redirect('/home');
    }
    return next();
  } else {
    // User is not logged in, redirect to /login if they try to visit any other page
    if (req.originalUrl !== '/login' && req.originalUrl !== '/register') {
      return res.redirect('/login');
    }
    return next();
  }
};

app.use(checkLoginStatus); // Apply this middleware to all routes

// PASSPORT STRATEGY SETUP
passport.use(
  new LocalStrategy(
    {
      usernameField: "email", // Match email field in login form
      passwordField: "password", // Match password field in login form
    },
    async (email, password, done) => {
      try {
        // Replace Sequelize with raw SQL query to get the user by email
        const result = await client.query(
          'SELECT * FROM "User" WHERE "email" = $1', [email]
        );
        
        const user = result.rows[0];
        if (!user) {
          return done(null, false, { message: "User not found" });
        }

        // Check if the password is correct
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return done(null, false, { message: "Invalid password" });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// SERIALIZE AND DESERIALIZE USER
passport.serializeUser((user, done) => {
  done(null, user.id); // Store only the user ID in the session
});

passport.deserializeUser(async (id, done) => {
  try {
    // Replace Sequelize with raw SQL query to get user by ID
    const result = await client.query(
      'SELECT * FROM "User" WHERE "id" = $1', [id]
    );
    
    const user = result.rows[0];
    done(null, user); // If user exists, return the user object
  } catch (error) {
    done(error, null); // If there's an error, return null
  }
});

app.set("port", process.env.PORT || 3000);
app.set("view engine", "ejs");

const router = require("./routes/index");
app.use("/", router);

app.listen(app.get("port"), () => {
  console.log(`Server running at http://localhost:${app.get("port")}`);
});
