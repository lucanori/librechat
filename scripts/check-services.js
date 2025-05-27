#!/usr/bin/env node

const { execSync } = require('child_process');
const net = require('net');

const services = [
  { name: 'MongoDB', host: '127.0.0.1', port: 27017 },
  { name: 'Meilisearch', host: '127.0.0.1', port: 7700 },
  { name: 'PostgreSQL (VectorDB)', host: '127.0.0.1', port: 5432 },
  { name: 'RAG API', host: '127.0.0.1', port: 8000 }
];

function checkPort(host, port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);
    
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    
    socket.on('error', () => {
      resolve(false);
    });
    
    socket.connect(port, host);
  });
}

async function checkServices() {
  console.log('🔍 Checking One Ring development services...\n');
  
  let allRunning = true;
  
  for (const service of services) {
    const isRunning = await checkPort(service.host, service.port);
    const status = isRunning ? '✅ Running' : '❌ Not running';
    const portInfo = `${service.host}:${service.port}`;
    
    console.log(`${status} - ${service.name} (${portInfo})`);
    
    if (!isRunning) {
      allRunning = false;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  
  if (allRunning) {
    console.log('🎉 All services are running! You can start development with:');
    console.log('   npm run dev');
  } else {
    console.log('⚠️  Some services are not running. Start them with:');
    console.log('   npm run dev:services');
    console.log('\nOr start everything at once with:');
    console.log('   npm run dev:full');
  }
  
  console.log('\n📖 For more information, see DEVELOPMENT.md');
}

checkServices().catch(console.error);