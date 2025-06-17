
//  [BWM-XMD QUANTUM EDITION]                                           
//  >> A superposition of elegant code states                           
//  >> Collapsed into optimal execution                                
//  >> Scripted by Sir Ibrahim Adams                                    
//  >> Version: 8.3.5-quantum.7

const { adams } = require("../Ibrahim/adams");
const os = require('os');

adams({
    nomCom: "botsate",
    categorie: "General",
    reaction: "📊"
}, async (dest, zk, commandeOptions) => {
    const { ms, repondre, prefixe, nomAuteurMessage, mybotpic } = commandeOptions;

    try {
        // Calculate uptime
        const uptimeSeconds = process.uptime();
        const days = Math.floor(uptimeSeconds / (24 * 3600));
        const hours = Math.floor((uptimeSeconds % (24 * 3600)) / 3600);
        const minutes = Math.floor((uptimeSeconds % 3600) / 60);
        const seconds = Math.floor(uptimeSeconds % 60);

        // Get current date and time
        const now = new Date();
        const currentDate = now.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const currentTime = now.toLocaleTimeString('en-US', {
            hour12: true,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        // Get system information
        const totalMemory = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
        const freeMemory = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
        const usedMemory = (totalMemory - freeMemory).toFixed(2);
        const cpuUsage = os.loadavg()[0].toFixed(2);
        const platform = os.platform();
        const nodeVersion = process.version;

        // Create status report
        const statusReport = `
╭─────────────────────────╮
│    🤖 BWM-XMD BOT STATUS    │
╰─────────────────────────╯

┌─── ⏰ TIME INFORMATION ───┐
│ 📅 Date: ${currentDate}
│ 🕐 Time: ${currentTime}
│ 🌍 Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}
└───────────────────────────┘

┌─── 🚀 UPTIME STATUS ───┐
│ ⏱️ Bot Uptime: ${days}d ${hours}h ${minutes}m ${seconds}s
│ 🔄 Running Since: ${new Date(Date.now() - uptimeSeconds * 1000).toLocaleString()}
└─────────────────────────┘

┌─── 💻 SYSTEM INFO ───┐
│ 🖥️ Platform: ${platform}
│ 📦 Node.js: ${nodeVersion}
│ 💾 Total RAM: ${totalMemory} GB
│ 🟢 Free RAM: ${freeMemory} GB
│ 🔴 Used RAM: ${usedMemory} GB
│ ⚡ CPU Load: ${cpuUsage}%
└─────────────────────────┘

┌─── 🔧 BOT DETAILS ───┐
│ 🤖 Bot Name: BWM-XMD QUANTUM
│ 👨‍💻 Developer: Ibrahim Adams
│ 📱 Version: 8.3.5-quantum.7
│ 🏷️ Prefix: ${prefixe}
│ 👤 Requested by: ${nomAuteurMessage}
└───────────────────────────┘

╭─────────────────────────╮
│  ✅ Bot is running smoothly!  │
╰─────────────────────────╯`;

        // Send the status report
        await zk.sendMessage(dest, {
            text: statusReport,
            contextInfo: {
                externalAdReply: {
                    title: "🤖 BWM-XMD Bot Status Report",
                    body: "Real-time bot statistics and system information",
                    thumbnailUrl: mybotpic(),
                    sourceUrl: "https://github.com/Ibrahim-Adams/BWM-XMD",
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        });

    } catch (error) {
        console.error("Error in botsate command:", error);
        await repondre("❌ An error occurred while generating the bot status report. Please try again later.");
    }
});
