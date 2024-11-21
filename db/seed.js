const bcrypt = require("bcrypt");
const User = require("../models/user"); // Import your models (e.g., User model)
const sequelize = require("./db_connect"); // Import your sequelize instance

(async () => {
  try {
    // Drop all tables (optional, be careful with this in production)
    await sequelize.drop();

    // Sync the models (create tables if they don't exist)
    await sequelize.sync({ force: true }); // Use force: true to recreate tables (use carefully)
    console.log("All tables dropped and recreated.");

    // Seed the database with initial user data
    const hashedPasswordJohn = await bcrypt.hash("password123", 10); // Example of password hashing
    const hashedPasswordJane = await bcrypt.hash("password456", 10);

    await User.create({
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      zipCode: 12345, // zipCode should be a valid integer
      password: hashedPasswordJohn, // Ensure password is hashed
    });

    await User.create({
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.smith@example.com",
      zipCode: 67890,
      password: hashedPasswordJane, // Ensure password is hashed
    });

    console.log("Database seeded with initial user data.");
  } catch (error) {
    console.error("Error while seeding the database:", error);
  } finally {
    // Close the database connection
    await sequelize.close();
  }
})();
