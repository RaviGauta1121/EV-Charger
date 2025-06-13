// src/utils/createDefaultAdmin.js
const User = require('../models/User');

const createDefaultAdmin = async () => {
  try {
    // Check if any admin exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (!existingAdmin) {
      const adminUser = await User.create({
        name: 'Default Admin',
        email: 'admin@company.com',
        password: 'admin123456', // Change this in production
        role: 'admin'
      });
      
      console.log('✅ Default admin user created:');
      console.log('📧 Email: admin@company.com');
      console.log('🔑 Password: admin123456');
      console.log('⚠️  Please change the password after first login');
      
      return adminUser;
    } else {
      console.log('✅ Admin user already exists');
      return existingAdmin;
    }
  } catch (error) {
    console.error('❌ Error creating default admin:', error);
    throw error;
  }
};

module.exports = createDefaultAdmin;