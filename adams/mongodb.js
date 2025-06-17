
//  [BWM-XMD QUANTUM EDITION]                                           
//  >> A superposition of elegant code states                           
//  >> Collapsed into optimal execution                                
//  >> Scripted by Sir Ibrahim Adams                                    
//  >> Version: 8.3.5-quantum.7

const { adams } = require("../Ibrahim/adams");
const { checkMongoDBConnection } = require("../Ibrahim/mongodb");
const config = require("../config");

adams({
    nomCom: "mongodb",
    categorie: "General",
    reaction: "🗄️"
}, async (dest, zk, commandeOptions) => {
    const { ms, repondre, prefixe, nomAuteurMessage, mybotpic } = commandeOptions;

    try {
        // Check if MONGO_DB is configured
        if (!config.MONGO_DB || config.MONGO_DB.trim() === "") {
            const noConfigMessage = `
╭─────────────────────────╮
│    🗄️ MONGODB STATUS    │
╰─────────────────────────╯

❌ **Database Not Configured**

┌─── ⚠️ CONFIGURATION REQUIRED ───┐
│ The MONGO_DB environment variable
│ has not been set up yet.
│ 
│ Please add your MongoDB connection
│ string to the MONGO_DB secret variable
│ in your Replit environment.
└────────────────────────────────┘

💡 **How to configure:**
1. Go to Secrets in your Replit
2. Add key: MONGO_DB
3. Add value: Your MongoDB connection string
4. Restart the bot

👤 **Requested by:** ${nomAuteurMessage}`;

            await zk.sendMessage(dest, {
                text: noConfigMessage,
                contextInfo: {
                    externalAdReply: {
                        title: "🗄️ MongoDB Configuration Required",
                        body: "Set up MONGO_DB environment variable",
                        thumbnailUrl: mybotpic || "https://files.catbox.moe/sd49da.jpg",
                        sourceUrl: "https://github.com/Ibrahim-Adams/BWM-XMD",
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            });
            return;
        }

        // Check MongoDB connection
        const connectionResult = await checkMongoDBConnection();
        
        const statusEmoji = connectionResult.success ? "✅" : "❌";
        const statusText = connectionResult.success ? "CONNECTED" : "DISCONNECTED";
        const statusColor = connectionResult.success ? "🟢" : "🔴";
        
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

        // Mask the connection string for security
        const maskedConnectionString = config.MONGO_DB.replace(
            /mongodb\+srv:\/\/([^:]+):([^@]+)@/,
            'mongodb+srv://***:***@'
        ).replace(
            /mongodb:\/\/([^:]+):([^@]+)@/,
            'mongodb://***:***@'
        );

        const mongoStatusMessage = `
╭─────────────────────────╮
│    🗄️ MONGODB STATUS    │
╰─────────────────────────╯

${statusEmoji} **Database Status: ${statusText}**

┌─── 📊 CONNECTION INFO ───┐
│ ${statusColor} Status: ${connectionResult.success ? 'Online' : 'Offline'}
│ 🔗 Connection: ${maskedConnectionString.substring(0, 50)}...
│ 📝 Message: ${connectionResult.message}
└─────────────────────────┘

┌─── ⏰ CHECK DETAILS ───┐
│ 📅 Date: ${currentDate}
│ 🕐 Time: ${currentTime}
│ 🤖 Bot: BWM-XMD QUANTUM
│ 👤 Requested by: ${nomAuteurMessage}
└──────────────────────────┘

${connectionResult.success ? 
    '✅ **Database is ready for operations!**' : 
    '⚠️ **Database connection failed. Check your configuration.**'
}`;

        await zk.sendMessage(dest, {
            text: mongoStatusMessage,
            contextInfo: {
                externalAdReply: {
                    title: `🗄️ MongoDB ${statusText}`,
                    body: `Database status: ${connectionResult.success ? 'Connected' : 'Disconnected'}`,
                    thumbnailUrl: mybotpic || "https://files.catbox.moe/sd49da.jpg",
                    sourceUrl: "https://github.com/Ibrahim-Adams/BWM-XMD",
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        });

    } catch (error) {
        console.error("Error in mongodb command:", error);
        await repondre("❌ An error occurred while checking MongoDB status. Please try again later.");
    }
});
