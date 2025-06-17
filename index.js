
//  [BWM-XMD QUANTUM EDITION]                                           
//  >> A superposition of elegant code states                           
//  >> Collapsed into optimal execution                                
//  >> Scripted by Sir Ibrahim Adams                                    
//  >> Version: 8.3.5-quantum.7

const express = require('express');
const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');
const adams = require("./config");
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Basic web server for health checks
app.get('/', (req, res) => {
  res.json({
    status: 'BWM-XMD is running',
    version: '8.3.5-quantum.7',
    author: 'Sir Ibrahim Adams'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start web server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌐 Web server running on http://0.0.0.0:${PORT}`);
  startBot();
});

async function startBot() {
  try {
    console.log('🚀 Starting BWM-XMD Bot...');
    
    // Initialize auth state
    const { state, saveCreds } = await useMultiFileAuthState('./bwmxmd');
    
    // Create WhatsApp connection
    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: true,
      logger: pino({ level: 'silent' }),
      browser: ['BWM-XMD', 'Chrome', '1.0.0']
    });

    // Save credentials when updated
    sock.ev.on('creds.update', saveCreds);

    // Handle connection updates
    sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect } = update;
      
      if (connection === 'close') {
        const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
        console.log('Connection closed due to:', lastDisconnect?.error, 'Reconnecting:', shouldReconnect);
        
        if (shouldReconnect) {
          startBot();
        }
      } else if (connection === 'open') {
        console.log('✅ Bot connected successfully!');
        
        if (adams.STARTING_BOT_MESSAGE === 'yes') {
          console.log('📱 BWM-XMD is now online and ready!');
        }
      }
    });

    // Load command modules
    loadCommands(sock);

  } catch (error) {
    console.error('❌ Error starting bot:', error.message);
    setTimeout(startBot, 5000); // Retry after 5 seconds
  }
}

function loadCommands(sock) {
  const commandDirs = ['./adams', './bwmxmd'];
  
  commandDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir).filter(file => file.endsWith('.js'));
      
      files.forEach(file => {
        try {
          const commandPath = path.join(dir, file);
          require(commandPath);
          console.log(`📁 Loaded: ${file}`);
        } catch (error) {
          console.log(`⚠️  Failed to load ${file}:`, error.message);
        }
      });
    }
  });
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n👋 BWM-XMD shutting down gracefully...');
  process.exit(0);
});

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled rejection:', err);
});
