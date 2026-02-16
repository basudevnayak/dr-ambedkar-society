// scripts/test-mongodb-connection.js
const { MongoClient } = require('mongodb');

// Your connection string from .env.local
const uri = "mongodb+srv://drambedkarsociety32:drambedkarsociety32@cluster0.lefkyrz.mongodb.net/investationTeam?retryWrites=true&w=majority&appName=Cluster0";

async function testConnection() {
  console.log('🔍 Testing MongoDB Connection...\n');
  console.log('Connection URI:', uri.replace(/\/\/[^:]+:[^@]+@/, '//****:****@'));
  
  const client = new MongoClient(uri, {
    connectTimeoutMS: 10000,
    serverSelectionTimeoutMS: 10000
  });

  try {
    console.log('\n🔄 Attempting to connect...');
    await client.connect();
    console.log('✅ Connected successfully!');
    
    // Try to list databases
    const dbs = await client.db().admin().listDatabases();
    console.log('\n📊 Available databases:');
    dbs.databases.forEach(db => console.log(`   - ${db.name}`));
    
  } catch (error) {
    console.error('\n❌ Connection failed:', error.message);
    
    if (error.message.includes('bad auth')) {
      console.error('\n🔐 AUTHENTICATION ERROR:');
      console.error('   The username or password is incorrect for this database.');
      console.error('\n🔧 FIX:');
      console.error('   1. Go to MongoDB Atlas → Database Access');
      console.error('   2. Check if user "drambedkarsociety32" exists');
      console.error('   3. Reset the password if needed');
      console.error('   4. Make sure the user has access to "investationTeam" database');
    }
    
    if (error.message.includes('ENOTFOUND')) {
      console.error('\n🌐 DNS ERROR:');
      console.error('   The cluster domain cannot be resolved.');
      console.error('\n🔧 FIX:');
      console.error('   1. Check if cluster name is correct');
      console.error('   2. Try changing DNS to 8.8.8.8');
    }
  } finally {
    await client.close();
  }
}

testConnection();