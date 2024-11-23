const User = require("../models/user");
const passport = require("passport");
const jsonWebToken = require("jsonwebtoken");
const { Op } = require("sequelize");
const { StatusCodes } = require("http-status-codes");

// Extract user parameters from request body
const getUserParams = (body) => {
  return {
    first_name: body.first_name,
    last_name: body.last_name,
    password: body.password,
    email: body.email,
    phone: body.phone, // Ensure this exists
    role_id: parseInt(body.role_id, 10), // Ensure role is mapped to role_id
  };
};

const fetchTalents = (req, res, next) => {
  User.findAll()
    .then((users) => {
      res.locals.users = users;
      next();
    })
    .catch((error) => {
      console.log(`Error fetching users: ${error.message}`);
      next(error);
    });
};

const renderTalentList = (req, res) => {
  res.render("listTalents");
};

const renderRegister = (req, res) => {
  res.render("register");
};

const register = (req, res, next) => {
  if (req.skip) next();
  console.log("req.body: ", req.body);

  // Get the user data and create the user
  User.create(getUserParams(req.body))
    .then((user) => {
      req.flash(
        "success",
        `${user.first_name} ${user.last_name}'s account created successfully!`
      );

      // Log the user in automatically after registration
      req.login(user, (err) => {
        if (err) {
          console.log('Error logging in after registration:', err);
          return next(err);
        }
        res.locals.redirect = "/home";
        next();
      });
    })
    .catch((error) => {
      console.log(`Error creating user: ${error.message}`);
      req.flash(
        "error",
        `Failed to create user account because: ${error.message}.`
      );
      res.locals.redirect = "/register";
      next();
    });
};


const redirectView = (req, res, next) => {
  const redirectPath = res.locals.redirect;
  if (redirectPath) res.redirect(redirectPath);
  else next();
};

const fetchUser = (req, res, next) => {
  const userId = req.params.id;
  console.log("fetch user: ", req.params.id);

  User.findByPk(userId)
    .then((user) => {
      res.locals.user = user;
      next();
    })
    .catch((error) => {
      console.log(`Error fetching user by ID: ${error.message}`);
      next(error);
    });
};

const renderProfile = (req, res) => {
    res.render("profile");
};

const renderHome = (req, res) => {
  res.render("home");
};

const renderEditUser = (req, res, next) => {
  const userId = req.params.id;

  User.findByPk(userId)
    .then((user) => {
      res.render("editUser", { user });
    })
    .catch((error) => {
      console.log(`Error fetching user by ID: ${error.message}`);
      next(error);
    });
};

const updateUser = (req, res, next) => {
  const userId = req.params.id;

  User.update(getUserParams(req.body), { where: { id: userId } })
    .then(() => {
      req.flash("success", "User updated successfully!");
      res.locals.redirect = `/${userId}`;
      next();
    })
    .catch((error) => {
      console.log(`Error updating user by ID: ${error.message}`);
      req.flash("error", `Failed to update user because: ${error.message}`);
      next(error);
    });
};

const deleteUser = (req, res, next) => {
  const userId = req.params.id;

  User.destroy({ where: { id: userId } })
    .then(() => {
      req.flash("success", "User deleted successfully!");
      res.locals.redirect = "/";
      next();
    })
    .catch((error) => {
      console.log(`Error deleting user: ${error.message}`);
      req.flash("error", `Failed to delete user because: ${error.message}`);
      next(error);
    });
};

const login = (req, res) => {
  res.render("login");
};

const authenticate = (req, res, next) => {
  passport.authenticate("local", (error, user, info) => {
    if (error) {
      req.flash("error", "Authentication error.");
      return res.redirect("/login");
    }

    if (!user) {
      req.flash("error", "Failed to login.");
      return res.redirect("/login");
    }

    req.login(user, (loginError) => {
      if (loginError) {
        req.flash("error", "Login failed.");
        return res.redirect("/login");
      }

      const signedToken = jsonWebToken.sign(
        { data: user.id },
        "secret_encoding_passphrase",
        { expiresIn: "1d" }
      );

      req.session.token = signedToken;

      req.flash("success", "Logged in!");
      res.redirect("/home");
    });
  })(req, res, next);
};

const logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "You have been logged out!");
    res.locals.redirect = "/";
    next();
  });
};

const { body, validationResult } = require("express-validator");

const validate = [
  body("email")
    .normalizeEmail({ all_lowercase: true })
    .trim()
    .isEmail()
    .withMessage("Email is invalid"),
  body("password").notEmpty().withMessage("Password cannot be empty"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const messages = errors.array().map((e) => e.msg);
      req.flash("error", messages.join(" and "));
      res.locals.redirect = "/register";
      return res.redirect(res.locals.redirect);
    }
    next();
  },
];

// Middleware to verify JWT for protected routes
const verifyJWT = async (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1]; // Extract token from the Authorization header
  if (!token) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      error: true,
      message: "Token is required.",
    });
  }

  try {
    const payload = jsonWebToken.verify(token, "secret_encoding_passphrase"); // Verify the token
    const user = await User.findByPk(payload.data); // Use Sequelize's findByPk
    if (!user) {
      return res.status(StatusCodes.FORBIDDEN).json({
        error: true,
        message: "No User account found.",
      });
    }
    req.user = user; // Attach user to the request
    next();
  } catch (error) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      error: true,
      message: "Invalid or expired token.",
    });
  }
};

/*
const loginOrHomePage = (req, res) => {
  if (req.user) {
    // User is logged in, redirect to /home
    res.redirect("/home");
  } else {
    // User is not logged in, redirect to /login
    res.redirect("/login");
  }
};
*/


module.exports = {
  getUserParams,
  register,
  redirectView,
  fetchUser,
  updateUser,
  deleteUser,
  login,
  authenticate,
  validate,
  logout,
  fetchTalents,
  renderEditUser,
  renderRegister,
  renderProfile,
  renderTalentList,
  verifyJWT,
  renderHome
};
