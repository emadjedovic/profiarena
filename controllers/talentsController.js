const { client } = require("../db/connect"); // Make sure to import client
const queries = require("../db/queries"); // Import the query file
const multer = require("multer"); // If you haven't imported multer yet

const updateTalent = async (req, res, next) => {
  
  const userId = req.params.id;

  // Access regular form data
  const {
    first_name,
    last_name,
    email,
    phone,
    address,
    date_of_birth,
    about,
    education,
    skills,
    languages,
    socials,
    projects,
  } = req.body;

  // File data (cv and certificates)
  const cvFile = req.files["cv"] ? req.files["cv"][0] : null;
  const certificatesFiles = req.files["certificates"]
    ? req.files["certificates"]
    : [];

  // Handle missing required fields
  if (!first_name || !last_name || !email) {
    req.flash("error", "First name, last name, and email are required!");
    return res.redirect(`/talents/${userId}/edit`);
  }

  // Check if a new CV file is uploaded
  const cvPath = cvFile ? cvFile.path : res.locals.currentUser.cv; // Keep the existing CV if no new file is uploaded

  // keep the existing certificates and add the new ones
  const certificatesPaths = certificatesFiles.length > 0
  ? [
      ...(res.locals.currentUser.certificates || []), // Existing certificates
      ...certificatesFiles.map((file) => file.path),  // New certificates
    ]
  : res.locals.currentUser.certificates || [];


  // Convert string fields to arrays (split by commas and remove extra spaces)
  const parseArray = (field) => {
    return field
      ? field
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : null; // Ensure no empty values
  };

  try {
    // Update the user's information in the database
    await client.query(queries.updateTalentSQL, [
      first_name,
      last_name,
      email,
      phone || null, // If phone is empty, store null
      address || null, // If address is empty, store null
      date_of_birth || res.locals.currentUser.date_of_birth,
      about || null, // If about is empty, store null
      parseArray(education), // Convert education to array
      parseArray(skills), // Convert skills to array
      parseArray(languages), // Convert languages to array
      parseArray(socials), // Convert socials to array
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

const fs = require('fs'); // File system module

// DELETE CV
const deleteCV = async (req, res, next) => {
  const userId = req.params.id;

  try {
    // Fetch user data
    const result = await client.query('SELECT * FROM "User" WHERE id = $1', [userId]);
    const user = result.rows[0];

    if (!user.cv) {
      req.flash("error", "No CV found to delete!");
      return res.redirect(`/talent/profile`);
    }

    // Delete CV file from uploads folder
    const cvPath = `uploads/${user.cv}`;
    if (fs.existsSync(cvPath)) fs.unlinkSync(cvPath);

    // Update the database to remove the CV reference
    await client.query('UPDATE "User" SET cv = NULL WHERE id = $1', [userId]);

    req.flash("success", "CV deleted successfully!");
    res.redirect(`/talent/profile`);
  } catch (error) {
    console.log(`Error deleting CV: ${error.message}`);
    req.flash("error", `Failed to delete CV: ${error.message}`);
    next(error);
  }
};

// DELETE Certificate
const deleteCertificate = async (req, res, next) => {
  const userId = req.params.id;
  const certificatePath = req.body.certificatePath;

  try {
    // Fetch user data
    const result = await client.query('SELECT * FROM "User" WHERE id = $1', [userId]);
    const user = result.rows[0];

    if (!user.certificates || !user.certificates.includes(certificatePath)) {
      req.flash("error", "Certificate not found!");
      return res.redirect(`/talent/profile`);
    }

    // Delete certificate file from uploads folder
    const fullPath = `uploads/${certificatePath}`;
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);

    // Update the database to remove the specific certificate
    const updatedCertificates = user.certificates.filter(cert => cert !== certificatePath);
    await client.query('UPDATE "User" SET certificates = $1 WHERE id = $2', [updatedCertificates, userId]);

    req.flash("success", "Certificate deleted successfully!");
    res.redirect(`/talent/profile`);
  } catch (error) {
    console.log(`Error deleting certificate: ${error.message}`);
    req.flash("error", `Failed to delete certificate: ${error.message}`);
    next(error);
  }
};

// DELETE Social Link
const deleteSocial = async (req, res, next) => {
  const userId = req.params.id;
  const socialLink = req.body.socialLink;

  try {
    // Fetch user data
    const result = await client.query('SELECT * FROM "User" WHERE id = $1', [userId]);
    const user = result.rows[0];

    if (!user.socials || !user.socials.includes(socialLink)) {
      req.flash("error", "Social link not found!");
      return res.redirect(`/talent/profile`);
    }

    // Update database to remove the specific social link
    const updatedSocials = user.socials.filter(link => link !== socialLink);
    await client.query('UPDATE "User" SET socials = $1 WHERE id = $2', [updatedSocials, userId]);

    req.flash("success", "Social link deleted successfully!");
    res.redirect(`/talent/profile`);
  } catch (error) {
    console.log(`Error deleting social link: ${error.message}`);
    req.flash("error", `Failed to delete social link: ${error.message}`);
    next(error);
  }
};


module.exports = {
  updateTalent,
  deleteCV,
  deleteCertificate,
  deleteSocial
};
