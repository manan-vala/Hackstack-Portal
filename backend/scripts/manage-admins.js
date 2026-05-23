require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const AdminWhitelist = require('../models/AdminWhitelist');

const usage = () => {
  console.log(`
🚀 Hackstack Admin Whitelist CLI Manager
Usage:
  node scripts/manage-admins.js add <username> [--delete]  - Add a GitHub username as admin. Include --delete flag to allow deletion.
  node scripts/manage-admins.js remove <username>          - Remove a GitHub username from the admin whitelist.
  node scripts/manage-admins.js set-delete <username> <true|false>  - Set or update the delete access flag.
  node scripts/manage-admins.js list                       - List all whitelisted admin usernames.
`);
  process.exit(1);
};

const args = process.argv.slice(2);
if (args.length === 0) {
  usage();
}

const command = args[0].toLowerCase();
const username = args[1] ? args[1].trim().toLowerCase() : null;

if ((command === 'add' || command === 'remove' || command === 'set-delete') && !username) {
  console.error(`❌ Error: Username is required for '${command}' command.`);
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
        await AdminWhitelist.create({ githubUsername: username, canDelete });
        console.log(`✨ Success: GitHub username '${username}' whitelisted as admin. [Delete Access: ${canDelete ? 'Yes' : 'No'}]`);
      } catch (err) {
        if (err.code === 11000) {
          console.log(`ℹ️ Info: GitHub username '${username}' is already whitelisted.`);
        } else {
          throw err;
        }
      }
    } else if (command === 'remove') {
      const res = await AdminWhitelist.deleteOne({ githubUsername: username });
      if (res.deletedCount > 0) {
        console.log(`🗑️ Success: GitHub username '${username}' has been removed from the admin whitelist.`);
      } else {
        console.log(`ℹ️ Info: GitHub username '${username}' was not found in the admin whitelist.`);
      }
    } else if (command === 'set-delete') {
      const flagVal = args[2] ? args[2].toLowerCase() : null;
      if (flagVal !== 'true' && flagVal !== 'false') {
        console.error(`❌ Error: set-delete requires either 'true' or 'false' as the value (e.g. node scripts/manage-admins.js set-delete spandan11106 true).`);
        usage();
      }
      const canDelete = flagVal === 'true';
      const res = await AdminWhitelist.findOneAndUpdate(
        { githubUsername: username },
        { canDelete },
        { new: true }
      );
      if (res) {
        console.log(`🔒 Success: Updated '${username}' delete access flag to ${canDelete ? 'Yes (true)' : 'No (false)'}.`);
      } else {
        console.log(`❌ Error: GitHub username '${username}' was not found in the admin whitelist.`);
      }
    } else if (command === 'list') {
      const list = await AdminWhitelist.find().sort({ createdAt: -1 });
      if (list.length === 0) {
        console.log('📭 The admin whitelist is currently empty.');
      } else {
        console.log(`📋 Whitelisted Admin GitHub Usernames (${list.length}):`);
        list.forEach((item, index) => {
          console.log(`  ${index + 1}. ${item.githubUsername} [Delete Access: ${item.canDelete ? '✅ Yes' : '❌ No'}] (Added: ${item.createdAt.toLocaleString()})`);
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
