// scripts/create-admin.js - Updated with standard connection string
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

// Use standard connection string (not SRV)
const uri = "mongodb+srv://drambedkarsociety32:drambedkarsociety.org@cluster0.lefkyrz.mongodb.net/investationTeam?retryWrites=true&w=majority&appName=Cluster0";
// mongodb+srv://drambedkarsociety32:drambedkarsociety.org@cluster0.lefkyrz.mongodb.net/?appName=Cluster0

async function createAdminUser() {
  const client = new MongoClient(uri, {
    connectTimeoutMS: 10000,
    serverSelectionTimeoutMS: 10000,
    // Add these options for better compatibility
    retryWrites: true,
    retryReads: true
  });

  try {
    console.log('🔄 Attempting to connect to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB successfully');

    const db = client.db('investationTeam');
    const users = db.collection('users');

    // Check if admin exists
    const existingAdmin = await users.findOne({ 
      $or: [
        { username: 'admin' },
        { email: 'admin@example.com' }
      ]
    });
    
    if (existingAdmin) {
      console.log('⚠️ Admin user already exists');
      return;
    }

    // Create admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = {
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    };

    const result = await users.insertOne(adminUser);
    console.log('✅ Admin user created successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Make sure your IP is whitelisted in MongoDB Atlas');
    console.error('2. Try changing DNS to 8.8.8.8');
    console.error('3. Check if your network blocks port 27017');
  } finally {
    await client.close();
  }
}

createAdminUser();