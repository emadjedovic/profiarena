const express = require("express");
const layouts = require("express-ejs-layouts");
const methodOverride = require("method-override");
const User = require("./models/user"); // Sequelize User model
const expressSession = require("express-session");
const cookieParser = require("cookie-parser");
const connectFlash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy; // Import LocalStrategy

const app = express();

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
  next();
});

// PASSPORT STRATEGY SETUP
passport.use(
  new LocalStrategy(
    {
      usernameField: "email", // Match Sequelize model's email field
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
          return done(null, false, { message: "User not found" });
        }
        const isValidPassword = await user.validPassword(password); // Replace with your password check logic
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
    const user = await User.findByPk(id); // Fetch user by ID
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

app.set("port", process.env.PORT || 3000);
app.set("view engine", "ejs");

const router = require("./routes/index");
app.use("/", router);

app.listen(app.get("port"), () => {
  console.log(`Server running at http://localhost:${app.get("port")}`);
});