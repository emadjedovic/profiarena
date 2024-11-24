const { client } = require("../db/connect"); // Make sure to import client
const queries = require("../db/queries"); // Import the query file
const multer = require('multer'); // If you haven't imported multer yet

const updateTalent = async (req, res, next) => {
  const userId = req.params.id;

  // Access regular form data
  const { first_name, last_name, email, phone, address, date_of_birth, about, education, skills, languages, socials, projects } = req.body;

  // File data (cv and certificates)
  const cvFile = req.files['cv'] ? req.files['cv'][0] : null;
  const certificatesFiles = req.files['certificates'] ? req.files['certificates'] : [];

  // Handle missing required fields
  if (!first_name || !last_name || !email) {
    req.flash("error", "First name, last name, and email are required!");
    return res.redirect(`/talents/${userId}/edit`);
  }

  // Handle files and create file paths
  const cvPath = cvFile ? cvFile.path : null;
  const certificatesPaths = certificatesFiles.length > 0 ? certificatesFiles.map(file => file.path) : null;

  try {
    // Update the user's information in the database
    await client.query(queries.updateTalentSQL, [
      first_name,
      last_name,
      email,
      phone || null, // If phone is empty, store null
      address || null, // If address is empty, store null
      date_of_birth || null, // If date_of_birth is empty, store null
      about || null, // If about is empty, store null
      education ? education.split(',').map(item => item.trim()) : null, // Convert to array and trim spaces
      skills ? skills.split(',').map(item => item.trim()) : null, // Convert to array and trim spaces
      languages ? languages.split(',').map(item => item.trim()) : null, // Convert to array and trim spaces
      socials ? socials.split(',').map(item => item.trim()) : null, // Convert to array and trim spaces
      projects || null, // If projects is empty, store null
      cvPath, // Store file path of the uploaded CV
      certificatesPaths, // Store file paths of the uploaded certificates
      userId, // User ID for the WHERE clause
    ]);

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
