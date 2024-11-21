const User = require("../../models/user"); // Sequelize model
const { StatusCodes } = require("http-status-codes");
const jsonWebToken = require("jsonwebtoken");
const passport = require("passport");

// Function to extract user parameters from the request body
const getUserParams = (body) => {
  return {
    firstName: body.firstName,
    lastName: body.lastName,
    email: body.email,
    zipCode: parseInt(body.zipCode),
  };
};

// Fetch all users
const index = async (req, res, next) => {
  try {
    const users = await User.findAll(); // Sequelize's findAll method
    res.locals.users = users;
    next();
  } catch (error) {
    console.log(`Error fetching users: ${error.message}`);
    next(error);
  }
};

// Fetch a specific user by ID
const showUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = await User.findByPk(userId); // Sequelize's findByPk method
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: true,
        message: "User not found.",
      });
    }
    res.locals.user = user;
    next();
  } catch (error) {
    console.log(`Error fetching user by ID: ${error.message}`);
    next(error);
  }
};

// Respond with user data in JSON format
const respondJSON = (req, res) => {
  res.json({
    status: StatusCodes.OK,
    data: res.locals,
  });
};

// Handle errors and respond in JSON format
const errorJSON = (error, req, res, next) => {
  const errorObject = {
    status: StatusCodes.INTERNAL_SERVER_ERROR,
    message: error ? error.message : "Unknown Error.",
  };
  res.json(errorObject);
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

// Create a new user
const createUser = async (req, res, next) => {
  try {
    const userParams = getUserParams(req.body);
    const newUser = await User.create(userParams); // Sequelize's create method
    req.login(newUser, (loginError) => {
      if (loginError) {
        return next(new Error("Login failed after registration."));
      }
      res.json({
        success: true,
        message: "User created successfully.",
      });
    });
  } catch (error) {
    console.log(`Error creating user: ${error.message}`);
    next(error);
  }
};

// Authenticate user and generate JWT
const apiAuthenticate = (req, res, next) => {
  passport.authenticate("local", (errors, user) => {
    if (user) {
      const signedToken = jsonWebToken.sign(
        {
          data: user.id, // Use Sequelize's id
        },
        "secret_encoding_passphrase",
        { expiresIn: "1d" } // Set expiration to 1 day
      );
      res.json({
        success: true,
        token: signedToken,
      });
    } else {
      res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: "Could not authenticate user.",
      });
    }
  })(req, res, next);
};

module.exports = {
  getUserParams,
  index,
  showUser,
  respondJSON,
  errorJSON,
  verifyJWT,
  createUser,
  apiAuthenticate,
};
