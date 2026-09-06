import { User } from "../models/User.js";

export const seedAdminUser = async (): Promise<void> => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@cineverse.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123";

    let admin = await User.findOne({ email: adminEmail.toLowerCase() });

    if (!admin) {
      admin = await User.create({
        name: "CineVerse Admin",
        first_name: "CineVerse",
        surname: "Admin",
        email: adminEmail.toLowerCase(),
        password: adminPassword,
        role: "admin",
      });
      console.log(`🛡️ [Admin Seed] Created default admin account: ${adminEmail}`);
    } else {
      if (admin.role !== "admin") {
        admin.role = "admin";
        await admin.save();
        console.log(`🛡️ [Admin Seed] Updated existing user ${adminEmail} to admin role.`);
      }
    }
  } catch (error) {
    console.error("⚠️ [Admin Seed] Error checking/seeding admin user:", error);
  }
};
