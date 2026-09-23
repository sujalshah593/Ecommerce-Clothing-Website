import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./Models/User.js";
import connectDB from "./config/db.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    // Connect to database
    await connectDB();

    const adminEmail = "admin@example.com";
    
    // Check if admin already exists
    const adminExists = await User.findOne({ email: adminEmail });

    if (adminExists) {
      console.log("Admin user already exists!");
      console.log(`Email: ${adminEmail}`);
      console.log("Password: (previously set)");
      process.exit(0);
    }

    // Create new admin user
    const adminUser = new User({
      name: "Admin",
      email: adminEmail,
      password: "adminpassword123", // Password will be hashed automatically by the User model's pre-save hook
      isAdmin: true,
      isVerified: true,
    });

    await adminUser.save();
    
    console.log("=========================================");
    console.log("✅ Admin user created successfully!");
    console.log(`👤 Email:    ${adminEmail}`);
    console.log(`🔑 Password: adminpassword123`);
    console.log("=========================================");

    process.exit(0);
  } catch (error) {
    console.error(`❌ Error seeding admin: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
