const crypto = require('crypto');

console.log('Generate this key and add it to your .env file as MCP_API_KEY:');
console.log('hk-' + crypto.randomBytes(32).toString('hex'));
