const bcrypt = require("bcrypt");
const jsonWebToken = require("jsonwebtoken");
const { client } = require("../db/connect"); // Import the client from connect.js
const { StatusCodes } = require("http-status-codes");
const passport = require("passport");
const { userQueries } = require("../db/queries"); // Import the query file

// Extract user parameters from request body
const getUserParams = (body) => {
  return {
    first_name: body.first_name,
    last_name: body.last_name,
    password: body.password,
    email: body.email,
    phone: body.phone,
    role_id: parseInt(body.role_id, 10),
  };
};

// Register a new user
const register = async (req, res, next) => {
  if (req.skip) next();

  // Get the user data and hash the password
  const { password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

  const userParams = {
    ...getUserParams(req.body),
    password: hashedPassword, // Store hashed password
  };

  try {
    const result = await client.query(
      userQueries.createUser, // Use the query from queries.js
      [
        userParams.first_name,
        userParams.last_name,
        userParams.email,
        userParams.password,
        userParams.phone,
        userParams.role_id,
      ]
    );

    const user = result.rows[0];
    req.flash(
      "success",
      `${user.first_name} ${user.last_name}'s account created successfully!`
    );

    // Log the user in automatically after registration
    req.login(user, (err) => {
      if (err) {
        console.log("Error logging in after registration:", err);
        return next(err);
      }
      res.locals.user = user;
      return res.redirect("/home");
    });
  } catch (error) {
    console.log(`Error creating user: ${error.message}`);
    req.flash(
      "error",
      `Failed to create user account because: ${error.message}.`
    );
    return res.redirect("/register");
  }
};

// Delete a user
const deleteUser = async (req, res, next) => {
  const userId = req.params.id;

  try {
    await client.query(userQueries.deleteUser, [userId]); // Use the query from queries.js

    req.logout((err) => {
      if (err) {
        console.log(`Error logging out user after deletion: ${err.message}`);
        return next(err);
      }

      req.flash("success", "User deleted successfully!");
      res.redirect("/login");
    });
  } catch (error) {
    console.log(`Error deleting user: ${error.message}`);
    req.flash("error", `Failed to delete user because: ${error.message}`);
    return next(error);
  }
};

// Authenticate user login
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
      const sessionData = req.session;
      const passportData = req.session.passport;

      const signedToken = jsonWebToken.sign(
        { data: user.id },
        "secret_encoding_passphrase",
        { expiresIn: "1d" }
      );

      req.session.token = signedToken;
      req.flash("success", "Logged in!");
      return res.redirect("/home");
    });
  })(req, res, next);
};

// Logout the user
const logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "You have been logged out!");
    return res.redirect("/");
  });
};

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
    const result = await client.query(userQueries.getUserById, [payload.data]);
    const user = result.rows[0];

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

module.exports = {
  getUserParams,
  register,
  deleteUser,
  authenticate,
  logout,
  verifyJWT,
};
