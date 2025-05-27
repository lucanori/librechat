#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('🚀 Setting up One Ring for development...\n');

const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', '.env.dev.example');

if (!fs.existsSync(envPath)) {
  console.log('📄 Copying .env.dev.example to .env...');
  fs.copyFileSync(envExamplePath, envPath);
  console.log('✅ Environment file created!\n');
} else {
  console.log('📄 .env file already exists, skipping copy.\n');
}

const networkInterfaces = os.networkInterfaces();
const addresses = [];

Object.keys(networkInterfaces).forEach(interfaceName => {
  const interfaces = networkInterfaces[interfaceName];
  interfaces.forEach(interface => {
    if (interface.family === 'IPv4' && !interface.internal) {
      addresses.push(interface.address);
    }
  });
});

console.log('🌐 Network Configuration:');
if (addresses.length > 0) {
  console.log('   Detected IP addresses:');
  addresses.forEach(addr => {
    console.log(`   - ${addr}`);
  });
  console.log('\n   Update your .env file with one of these IP addresses:');
  console.log(`   DOMAIN_CLIENT=http://${addresses[0]}:3090`);
  console.log(`   DOMAIN_SERVER=http://${addresses[0]}:3080`);
} else {
  console.log('   No external IP addresses detected.');
  console.log('   You may need to manually configure DOMAIN_CLIENT and DOMAIN_SERVER in .env');
}

console.log('\n📝 Next steps:');
console.log('   1. Edit .env and replace YOUR_SERVER_IP with your actual server IP');
console.log('   2. Add your AI provider API keys to .env');
console.log('   3. Run: npm run dev:full');
console.log('\n🎉 Happy coding!');