const { MongoClient } = require('mongodb');

// Try different possible cluster name formats
const possibleUris = [
  // Your current (likely incorrect)
  "mongodb+srv://basudevnayak31:OPOgFhSnU8pb1x2x@cluster0.exfu446.mongodb.net/investationTeam?retryWrites=true&w=majority",
  
  // Common formats - try these variations
  "mongodb+srv://basudevnayak31:OPOgFhSnU8pb1x2x@cluster0.xxxxx.mongodb.net/investationTeam?retryWrites=true&w=majority",
  "mongodb+srv://basudevnayak31:OPOgFhSnU8pb1x2x@cluster0-shard-00-00.xxxxx.mongodb.net,cluster0-shard-00-01.xxxxx.mongodb.net,cluster0-shard-00-02.xxxxx.mongodb.net/investationTeam?retryWrites=true&w=majority",
  
  // Without SRV (standard connection)
  "mongodb://basudevnayak31:OPOgFhSnU8pb1x2x@cluster0.xxxxx.mongodb.net:27017/investationTeam?retryWrites=true&w=majority"
];

async function testConnection(uri, index) {
  console.log(`\n🔄 Testing URI ${index + 1}:`);
  console.log(uri.replace(/basudevnayak31:.*@/, 'basudevnayak31:****@'));
  
  const client = new MongoClient(uri, {
    connectTimeoutMS: 5000,
    serverSelectionTimeoutMS: 5000
  });

  try {
    await client.connect();
    console.log('✅ CONNECTION SUCCESSFUL!');
    await client.close();
    return true;
  } catch (error) {
    console.log('❌ Failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🔍 Testing MongoDB cluster name variations...\n');
  
  for (let i = 0; i < possibleUris.length; i++) {
    await testConnection(possibleUris[i], i);
  }
  
  console.log('\n⚠️  If all tests failed:');
  console.log('1. Your cluster name is likely different from "cluster0"');
  console.log('2. The project ID (exfu446) might be incorrect');
  console.log('3. Check your MongoDB Atlas dashboard for the exact connection string');
}

runTests();