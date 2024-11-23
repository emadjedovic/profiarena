const bcrypt = require("bcrypt");
const jsonWebToken = require("jsonwebtoken");
const { client } = require("../db/db_connect"); // Import the client from db_connect.js
const { StatusCodes } = require("http-status-codes");

// Extract user parameters from request body
const getUserParams = (body) => {
  return {
    first_name: body.first_name,
    last_name: body.last_name,
    password: body.password,
    email: body.email,
    phone: body.phone, 
    role_id: parseInt(body.role_id, 10),
    company_name: body.company_name,
  };
};

// Fetch all users
const fetchTalents = async (req, res, next) => {
  try {
    const result = await client.query('SELECT * FROM "User"');
    res.locals.users = result.rows;
    next();
  } catch (error) {
    console.log(`Error fetching users: ${error.message}`);
    next(error);
  }
};

// Render the talent list
const renderTalentList = (req, res) => {
  res.render("listTalents");
};

// Render register page
const renderRegister = (req, res) => {
  res.render("register");
};

// Register a new user
const register = async (req, res, next) => {
  if (req.skip) next();
  console.log("req.body: ", req.body);

  // Get the user data and hash the password
  const { password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

  const userParams = {
    ...getUserParams(req.body),
    password: hashedPassword, // Store hashed password
  };

  try {
    const result = await client.query(
      'INSERT INTO "User" ("first_name", "last_name", "email", "password", "phone", "role_id", "company_name") VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [
        userParams.first_name,
        userParams.last_name,
        userParams.email,
        userParams.password,
        userParams.phone,
        userParams.role_id,
        userParams.company_name
      ]
    );

    const user = result.rows[0];
    req.flash("success", `${user.first_name} ${user.last_name}'s account created successfully!`);

    // Log the user in automatically after registration
    req.login(user, (err) => {
      if (err) {
        console.log("Error logging in after registration:", err);
        return next(err);
      }
      res.locals.redirect = "/home";
      next();
    });
  } catch (error) {
    console.log(`Error creating user: ${error.message}`);
    req.flash("error", `Failed to create user account because: ${error.message}.`);
    res.locals.redirect = "/register";
    next();
  }
};

// Redirect view
const redirectView = (req, res, next) => {
  const redirectPath = res.locals.redirect;
  if (redirectPath) res.redirect(redirectPath);
  else next();
};

// Fetch a user by ID
const fetchUser = async (req, res, next) => {
  const userId = req.params.id;
  console.log("fetch user: ", req.params.id);

  try {
    const result = await client.query('SELECT * FROM "User" WHERE id = $1', [userId]);
    res.locals.user = result.rows[0];
    next();
  } catch (error) {
    console.log(`Error fetching user by ID: ${error.message}`);
    next(error);
  }
};

// Render profile page
const renderProfile = (req, res) => {
  res.render("profile");
};

// Render home page
const renderHome = (req, res) => {
  res.render("home");
};

// Render the edit user page
const renderEditUser = async (req, res, next) => {
  const userId = req.params.id;

  try {
    const result = await client.query('SELECT * FROM "User" WHERE id = $1', [userId]);
    const user = result.rows[0];
    res.render("editUser", { user });
  } catch (error) {
    console.log(`Error fetching user by ID: ${error.message}`);
    next(error);
  }
};

// Update a user
const updateUser = async (req, res, next) => {
  const userId = req.params.id;
  console.log("Req body: ", req.body);

  const { first_name, last_name, email, company_name } = req.body;

  if (!first_name || !last_name || !email) {
    req.flash("error", "First name, last name, and email are required!");
    return res.redirect(`/users/${userId}/edit`);
  }

  try {
    await client.query(
      'UPDATE "User" SET "first_name" = $1, "last_name" = $2, "email" = $3, "company_name" = $4 WHERE "id" = $5',
      [first_name, last_name, email, company_name, userId]
    );

    req.flash("success", "User updated successfully!");
    res.locals.redirect = `/${userId}`;
    next();
  } catch (error) {
    console.log(`Error updating user by ID: ${error.message}`);
    req.flash("error", `Failed to update user because: ${error.message}`);
    next(error);
  }
};

// Delete a user
const deleteUser = async (req, res, next) => {
  const userId = req.params.id;

  try {
    await client.query('DELETE FROM "User" WHERE id = $1', [userId]);

    req.flash("success", "User deleted successfully!");
    res.locals.redirect = "/";
    next();
  } catch (error) {
    console.log(`Error deleting user: ${error.message}`);
    req.flash("error", `Failed to delete user because: ${error.message}`);
    next(error);
  }
};

// Render login page
const login = (req, res) => {
  res.render("login");
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

// Logout the user
const logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "You have been logged out!");
    res.locals.redirect = "/";
    next();
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
    const result = await client.query('SELECT * FROM "User" WHERE id = $1', [payload.data]);
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
  redirectView,
  fetchUser,
  updateUser,
  deleteUser,
  login,
  authenticate,
  logout,
  fetchTalents,
  renderEditUser,
  renderRegister,
  renderProfile,
  renderTalentList,
  verifyJWT,
  renderHome,
};
