require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const AdminWhitelist = require('../models/AdminWhitelist');

const usage = () => {
  console.log(`
🚀 Hackstack Admin Whitelist CLI Manager
Usage:
  node scripts/manage-admins.js add <email> [--delete]  - Add a Google email as admin. Include --delete flag to allow deletion.
  node scripts/manage-admins.js remove <email>          - Remove a Google email from the admin whitelist.
  node scripts/manage-admins.js set-delete <email> <true|false>  - Set or update the delete access flag.
  node scripts/manage-admins.js list                       - List all whitelisted admin emails.
`);
  process.exit(1);
};

const args = process.argv.slice(2);
if (args.length === 0) {
  usage();
}

const command = args[0].toLowerCase();
const email = args[1] ? args[1].trim().toLowerCase() : null;

if ((command === 'add' || command === 'remove' || command === 'set-delete') && !email) {
  console.error(`❌ Error: Email is required for '${command}' command.`);
  usage();
}

const run = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in backend/.env");
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected successfully.\n');

    if (command === 'add') {
      const canDelete = args.includes('--delete');
      try {
        await AdminWhitelist.create({ email, canDelete });
        console.log(`✨ Success: Email '${email}' whitelisted as admin. [Delete Access: ${canDelete ? 'Yes' : 'No'}]`);
      } catch (err) {
        if (err.code === 11000) {
          console.log(`ℹ️ Info: Email '${email}' is already whitelisted.`);
        } else {
          throw err;
        }
      }
    } else if (command === 'remove') {
      const res = await AdminWhitelist.deleteOne({ email });
      if (res.deletedCount > 0) {
        console.log(`🗑️ Success: Email '${email}' has been removed from the admin whitelist.`);
      } else {
        console.log(`ℹ️ Info: Email '${email}' was not found in the admin whitelist.`);
      }
    } else if (command === 'set-delete') {
      const flagVal = args[2] ? args[2].toLowerCase() : null;
      if (flagVal !== 'true' && flagVal !== 'false') {
        console.error(`❌ Error: set-delete requires either 'true' or 'false' as the value (e.g. node scripts/manage-admins.js set-delete user@gmail.com true).`);
        usage();
      }
      const canDelete = flagVal === 'true';
      const res = await AdminWhitelist.findOneAndUpdate(
        { email },
        { canDelete },
        { new: true }
      );
      if (res) {
        console.log(`🔒 Success: Updated '${email}' delete access flag to ${canDelete ? 'Yes (true)' : 'No (false)'}.`);
      } else {
        console.log(`❌ Error: Email '${email}' was not found in the admin whitelist.`);
      }
    } else if (command === 'list') {
      const list = await AdminWhitelist.find().sort({ createdAt: -1 });
      if (list.length === 0) {
        console.log('📭 The admin whitelist is currently empty.');
      } else {
        console.log(`📋 Whitelisted Admin Emails (${list.length}):`);
        list.forEach((item, index) => {
          console.log(`  ${index + 1}. ${item.email} [Delete Access: ${item.canDelete ? '✅ Yes' : '❌ No'}] (Added: ${item.createdAt.toLocaleString()})`);
        });
      }
    } else {
      console.error(`❌ Error: Unknown command '${command}'.`);
      usage();
    }
  } catch (error) {
    console.error('❌ Error executing command:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB.');
    process.exit(0);
  }
};

run();
