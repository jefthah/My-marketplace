const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load env vars
dotenv.config();

console.log('Starting seeder...');
console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Found' : 'Not found');

const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for seeding');
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

const seedRoles = async () => {
  try {
    console.log('Loading Role model...');
    const Role = require('./models/role');
    
    console.log('Clearing existing roles...');
    await Role.deleteMany();

    console.log('Creating new roles...');
    const roles = [
      {
        roleName: 'admin',
        description: 'Administrator with full access to manage the system'
      },
      {
        roleName: 'user',
        description: 'Regular user with basic access permissions'
      }
    ];

    const createdRoles = await Role.insertMany(roles);
    console.log('Roles seeded successfully:', createdRoles.length);
    return createdRoles;
  } catch (error) {
    console.error(`Error seeding roles: ${error.message}`);
    throw error;
  }
};

const seedAdmin = async () => {
  try {
    console.log('Loading User model...');
    const User = require('./models/user');
    const Role = require('./models/role');
    
    console.log('Finding admin role...');
    const adminRole = await Role.findOne({ roleName: 'admin' });
    if (!adminRole) {
      throw new Error('Admin role not found');
    }
    
    console.log('Checking for existing admin...');
    const existingAdmin = await User.findOne({ email: 'admin@marketplace.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      return existingAdmin;
    }

    console.log('Creating admin user...');
    const adminUser = {
      username: 'admin',
      email: 'admin@marketplace.com',
      password: 'Admin@123456',
      roleID: adminRole._id
    };

    const createdAdmin = await User.create(adminUser);
    console.log('Admin user created successfully');
    return createdAdmin;
  } catch (error) {
    console.error(`Error creating admin: ${error.message}`);
    throw error;
  }
};

const runSeeder = async () => {
  try {
    console.log('=== Starting Database Seeding ===');
    
    await connectDB();
    
    console.log('\n--- Seeding Roles ---');
    await seedRoles();
    
    console.log('\n--- Seeding Admin User ---');
    await seedAdmin();
    
    console.log('\n=== Seeding Completed Successfully ===');
    process.exit(0);
  } catch (error) {
    console.error('\n=== Seeding Failed ===');
    console.error('Error:', error.message);
    process.exit(1);
  }
};

runSeeder();