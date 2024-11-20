const express = require("express");
const layouts = require("express-ejs-layouts");
const methodOverride = require("method-override");
const expressSession = require("express-session");
const cookieParser = require("cookie-parser");
const connectFlash = require("connect-flash");
const passport = require("passport");

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
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(connectFlash());
app.use((req, res, next) => {
  res.locals.flashMessages = req.flash();
  res.locals.loggedIn = req.isAuthenticated();
  res.locals.currentUser = req.user;
  res.locals.token = req.session.token;
  next();

});

app.set("port", process.env.PORT || 3000);
app.set("view engine", "ejs");

const router = require("./routes/index") 
app.use("/", router)

app.listen(app.get("port"), () => {
  console.log(`Server running at http://localhost:${app.get("port")}`);
});
