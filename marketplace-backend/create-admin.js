const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./src/models/user');
const Role = require('./src/models/role');

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin role exists
    let adminRole = await Role.findOne({ roleName: 'admin' });
    if (!adminRole) {
      adminRole = await Role.create({
        roleName: 'admin',
        description: 'Administrator with full access'
      });
      console.log('Admin role created');
    }

    // Check if admin user exists
    const existingAdmin = await User.findOne({ email: 'admin@jdsign.com' });
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      process.exit(0);
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@jdsign.com',
      password: hashedPassword,
      role: 'admin',
      roleID: adminRole._id,
      isVerified: true
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@jdsign.com');
    console.log('🔑 Password: admin123');
    console.log('👤 User ID:', adminUser._id);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
};

createAdminUser();
