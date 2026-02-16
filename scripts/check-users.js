// scripts/check-users.js
const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://basudevnayak31:OPOgFhSnU8pb1x2x@cluster0.exfu446.mongodb.net/investationTeam?retryWrites=true&w=majority&appName=Cluster0";

async function checkUsers() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('investationTeam');
    const users = db.collection('users');
    
    // Count total users
    const userCount = await users.countDocuments();
    console.log(`\n📊 Total users in database: ${userCount}`);
    
    // Find all users
    const allUsers = await users.find({}).toArray();
    
    if (allUsers.length === 0) {
      console.log('❌ No users found in database');
      return;
    }
    
    console.log('\n📋 All Users:');
    console.log('='.repeat(60));
    
    allUsers.forEach((user, index) => {
      console.log(`\n👤 User ${index + 1}:`);
      console.log(`   ID: ${user._id}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log(`   Active: ${user.isActive ? '✅' : '❌'}`);
      console.log(`   Has Password: ${user.password ? '✅' : '❌'}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
    console.log('\n🔌 MongoDB connection closed');
  }
}

checkUsers();