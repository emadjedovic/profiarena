const express = require("express");
const layouts = require("express-ejs-layouts");
const methodOverride = require("method-override");
const bcrypt = require("bcrypt");
const expressSession = require("express-session");
const cookieParser = require("cookie-parser");
const connectFlash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const favicon = require("serve-favicon");
const path = require("path");
const { formatDate } = require("./utils/dateFormating");
const { connect, client } = require("./db/connect");
const { createTables } = require("./db/schema");
const {
  getUserByEmailSQL,
  getUserByIdSQL,
} = require("./db/queries/userQueries");
require("dotenv").config();

const setupDatabase = async () => {
  await connect();
  // await createTables();
};

setupDatabase();

const pgSession = require("connect-pg-simple")(expressSession);

const app = express();

app.use(favicon(path.join(__dirname, "public", "favicon2.ico")));
app.use(express.static("public"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
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
    store: new pgSession({
      pool: client,
      tableName: "session",
    }),
    secret: "secret_passcode",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 600000 },
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
  res.locals.formatDate = formatDate;
  next();
});

const checkLoginStatus = (req, res, next) => {
  if (req.user) {
    if (
      req.originalUrl === "/" ||
      req.originalUrl === "/login" ||
      req.originalUrl === "/register"
    ) {
      return res.redirect("/home");
    }
    return next();
  } else {
    if (req.originalUrl !== "/login" && req.originalUrl !== "/register") {
      return res.redirect("/login");
    }
    return next();
  }
};

app.use(checkLoginStatus);

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const result = await client.query(getUserByEmailSQL, [email]);
        const user = result.rows[0];
        if (!user) {
          return done(null, false, { message: "User not found" });
        }

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

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await client.query(getUserByIdSQL, [id]);
    const user = result.rows[0];
    if (user) {
      done(null, user);
    } else {
      done(new Error("User not found"), null);
    }
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
