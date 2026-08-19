const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');

async function seedAdmin() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined in .env file');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);

    const email = 'admin@medbook.com';
    const exists = await User.findOne({ email });
    if (exists) {
      exists.role = 'admin';
      exists.password = 'Admin@MedBook2026';
      await exists.save();
      console.log('✅ Admin user updated: admin@medbook.com / Admin@MedBook2026');
      process.exit(0);
    }

    const adminUser = new User({
      email,
      password: 'Admin@MedBook2026',
      role: 'admin',
    });

    await adminUser.save();
    console.log('✅ Admin created successfully: admin@medbook.com / Admin@MedBook2025');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    process.exit(1);
  }
}

seedAdmin();
