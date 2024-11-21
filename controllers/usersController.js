const User = require('../models/user');
const passport = require('passport');
const jsonWebToken = require('jsonwebtoken');
const { Op } = require('sequelize');

// Extract user parameters from request body
const getUserParams = (body) => ({
  firstName: body.firstName,
  lastName: body.lastName,
  email: body.email,
  password: body.password,
  zipCode: parseInt(body.zipCode, 10),
});

// Fetch all users
const index = (req, res, next) => {
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

// Render users/index view
const indexView = (req, res) => {
  res.render('users/index');
};

// Render new user form
const newUser = (req, res) => {
  res.render('users/new');
};

const createUser = (req, res, next) => {
  if (req.skip) next();

  // Get the user data and create the user
  User.create(getUserParams(req.body))
    .then((user) => {
      req.flash("success", `${user.firstName} ${user.lastName}'s account created successfully!`);
      res.locals.redirect = "/users";
      next();
    })
    .catch((error) => {
      console.log(`Error creating user: ${error.message}`);
      req.flash("error", `Failed to create user account because: ${error.message}.`);
      res.locals.redirect = "/users/new";
      next();
    });
};


// Redirect to a given path
const redirectView = (req, res, next) => {
  const redirectPath = res.locals.redirect;
  if (redirectPath) res.redirect(redirectPath);
  else next();
};

// Fetch a user by ID
const showUser = (req, res, next) => {
  const userId = req.params.id;

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

// Render user details
const showView = (req, res) => {
  res.render('users/show');
};

// Render edit user form
const showEdit = (req, res, next) => {
  const userId = req.params.id;

  User.findByPk(userId)
    .then((user) => {
      res.render('users/edit', { user });
    })
    .catch((error) => {
      console.log(`Error fetching user by ID: ${error.message}`);
      next(error);
    });
};

// Update user
const updateUser = (req, res, next) => {
  const userId = req.params.id;

  User.update(getUserParams(req.body), { where: { id: userId } })
    .then(() => {
      req.flash('success', 'User updated successfully!');
      res.locals.redirect = `/users/${userId}`;
      next();
    })
    .catch((error) => {
      console.log(`Error updating user by ID: ${error.message}`);
      req.flash('error', `Failed to update user because: ${error.message}`);
      next(error);
    });
};

// Delete user
const deleteUser = (req, res, next) => {
  const userId = req.params.id;

  User.destroy({ where: { id: userId } })
    .then(() => {
      req.flash('success', 'User deleted successfully!');
      res.locals.redirect = '/users';
      next();
    })
    .catch((error) => {
      console.log(`Error deleting user: ${error.message}`);
      req.flash('error', `Failed to delete user because: ${error.message}`);
      next(error);
    });
};

// Render login form
const login = (req, res) => {
  res.render('users/login');
};

// Authenticate user
const authenticate = (req, res, next) => {
  passport.authenticate('local', (error, user, info) => {
    if (error) {
      req.flash('error', 'Authentication error.');
      return res.redirect('/users/login');
    }

    if (!user) {
      req.flash('error', 'Failed to login.');
      return res.redirect('/users/login');
    }

    req.login(user, (loginError) => {
      if (loginError) {
        req.flash('error', 'Login failed.');
        return res.redirect('/users/login');
      }

      const signedToken = jsonWebToken.sign(
        { data: user.id },
        'secret_encoding_passphrase',
        { expiresIn: '1d' }
      );

      req.session.token = signedToken;

      req.flash('success', 'Logged in!');
      res.redirect('/');
    });
  })(req, res, next);
};

// Logout user
const logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash('success', 'You have been logged out!');
    res.locals.redirect = '/';
    next();
  });
};

// Validation
const { body, validationResult } = require('express-validator');

const validate = [
  body('email')
    .normalizeEmail({ all_lowercase: true })
    .trim()
    .isEmail()
    .withMessage('Email is invalid'),
  body('zipCode')
    .notEmpty()
    .withMessage('Zip code is required')
    .isInt()
    .withMessage('Zip code must be a number')
    .isLength({ min: 4, max: 5 })
    .withMessage('Zip code must be between 4 and 5 digits'),
  body('password').notEmpty().withMessage('Password cannot be empty'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const messages = errors.array().map((e) => e.msg);
      req.flash('error', messages.join(' and '));
      res.locals.redirect = '/users/new';
      return res.redirect(res.locals.redirect);
    }
    next();
  },
];

module.exports = {
  getUserParams,
  index,
  indexView,
  newUser,
  createUser,
  redirectView,
  showUser,
  showView,
  showEdit,
  updateUser,
  deleteUser,
  login,
  authenticate,
  validate,
  logout,
};
