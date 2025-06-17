
const fs = require('fs');
const path = require('path');

// Check if .env file exists and load it
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}

const configPath = path.join(__dirname, 'config.env');
const sessionPath = process.env.SESSION_ID === undefined ? configPath : process.env.SESSION_ID;

module.exports = {
  SESSION_ID: process.env.SESSION_ID || '',
  PREFIX: process.env.PREFIX || '.',
  PUBLIC_MODE: process.env.PUBLIC_MODE || 'yes',
  OWNER_NAME: process.env.OWNER_NAME || '',
  OWNER_NUMBER: process.env.OWNER_NUMBER || '',
  BOT_NAME: process.env.BOT_NAME || 'TREKKER-MD',
  BOT_IMAGE: process.env.BOT_IMAGE || '',
  STARTING_BOT_MESSAGE: process.env.STARTING_BOT_MESSAGE || 'yes',
  PRESENCE: process.env.PRESENCE || '3',
  AUTO_READ: process.env.AUTO_READ || 'no',
  AUTO_READ_STATUS: process.env.AUTO_READ_STATUS || 'yes',
  AUTO_DOWNLOAD_STATUS: process.env.AUTO_DOWNLOAD_STATUS || 'no',
  CHATBOT: process.env.CHATBOT || 'no',
  AUDIO_CHATBOT: process.env.AUDIO_CHATBOT || 'no',
  GROUPANTILINK_REMOVE: process.env.GROUPANTILINK_REMOVE || 'yes',
  ANTIDELETE_SENT_INBOX: process.env.ANTIDELETE_SENT_INBOX || 'yes',
  ANTIDELETE_RECOVER_CONVENTION: process.env.ANTIDELETE_RECOVER_CONVENTION || 'no',
  STATUS_REACT_EMOJIS: process.env.STATUS_REACT_EMOJIS || '🚀,🌎',
  AUTO_REACT: process.env.AUTO_REACT || 'no',
  WELCOME_MESSAGE: process.env.WELCOME_MESSAGE || 'no',
  GOODBYE_MESSAGE: process.env.GOODBYE_MESSAGE || 'no',
  HEROKU_APP_NAME: process.env.HEROKU_APP_NAME,
  HEROKU_API_KEY: process.env.HEROKU_API_KEY,
  AUTO_REACT_STATUS: process.env.AUTO_REACT_STATUS || 'yes',
  AUTO_REPLY_STATUS: process.env.AUTO_REPLY_STATUS || 'no',
  AUTO_REJECT_CALL: process.env.AUTO_REJECT_CALL || 'no',
  AUTO_BIO: process.env.AUTO_BIO || 'no',
  MONGO_DB: process.env.MONGO_DB || '',
  SESSION_ID: sessionPath,
  WORK_TYPE: sessionPath === configPath ? 'private' : 'private'
};

// Hot reload functionality
let configFile = require.resolve(__filename);
fs.watchFile(configFile, () => {
  fs.unwatchFile(configFile);
  console.log(`Updated '${__filename}'`);
  delete require.cache[configFile];
  require(configFile);
});
