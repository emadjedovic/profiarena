const { client } = require("../db/connect"); // Make sure to import client
const { userQueries, talentQueries } = require("../db/queries"); // Import the query file

const updateTalent = async (req, res, next) => {
  const userId = req.params.id;

  // add more fields
  const { first_name, last_name, email } = req.body;

  if (!first_name || !last_name || !email) {
    req.flash("error", "First name, last name, and email are required!");
    return res.redirect(`/talents/${userId}/edit`);
  }

  try {
    await client.query(talentQueries.updateTalent, [
      first_name,
      last_name,
      email,
      userId,
    ]); // Use the query from queries.js

    req.flash("success", "User updated successfully!");
    res.redirect(`/talent/profile`);
  } catch (error) {
    console.log(`Error updating user by ID: ${error.message}`);
    req.flash("error", `Failed to update user because: ${error.message}`);
    return next(error);
  }
};

module.exports = {
  updateTalent
};
