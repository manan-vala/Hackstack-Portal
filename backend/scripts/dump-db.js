require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

const run = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('❌ Error: MONGO_URI is not defined in backend/.env');
      process.exit(1);
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected successfully.\n');

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    if (collections.length === 0) {
      console.log('📭 The database is currently empty (no collections found).');
    } else {
      console.log(`📋 Found ${collections.length} collections. Dumping all data:\n`);

      for (const colInfo of collections) {
        const colName = colInfo.name;
        console.log(`=========================================`);
        console.log(`📂 Collection: ${colName}`);
        console.log(`=========================================`);

        const documents = await db.collection(colName).find({}).toArray();

        if (documents.length === 0) {
          console.log(`  (empty)\n`);
        } else {
          console.log(JSON.stringify(documents, null, 2));
          console.log(`\n  👉 Total documents in ${colName}: ${documents.length}\n`);
        }
      }
    }
  } catch (error) {
    console.error('❌ Database dump failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
    process.exit(0);
  }
};

run();
