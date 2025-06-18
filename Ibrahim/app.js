"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reagir = void 0;
async function reagir(dest, zok, msg, emoji) {
    await zok.sendMessage(dest, { react: { text: emoji, key: msg.key } });
}
exports.reagir = reagir;

// Assuming this is the file where the WhatsApp connection is established
// and the following logs are printed.  The auto-inform loader is integrated here.
async function connectToWhatsApp(zk) {
    try {
        console.log("Connected to WhatsApp");
        console.log("🌎 BWM XMD ONLINE 🌎");
        console.log("🚀 Enjoy quantum speed 🌎");

        // Load auto-inform functionality after WhatsApp connection
        try {
            const { loadAutoInform } = require('./auto_inform_loader');
            await loadAutoInform(zk);
        } catch (error) {
            console.error('❌ Failed to load auto-inform:', error);
        }

    } catch (error) {
        console.error("WhatsApp connection error:", error);
    }
}

exports.connectToWhatsApp = connectToWhatsApp;