
//  [BWM-XMD QUANTUM EDITION]                                           
//  >> A superposition of elegant code states                           
//  >> Collapsed into optimal execution                                
//  >> Scripted by Sir Ibrahim Adams                                    
//  >> Version: 8.3.5-quantum.7

const { adams } = require("../Ibrahim/adams");
const { MongoClient } = require('mongodb');

adams({
    nomCom: "informstate",
    categorie: "Messaging",
    reaction: "🔍"
}, async (dest, zk, commandeOptions) => {
    const { ms, repondre, prefixe, nomAuteurMessage, mybotpic } = commandeOptions;

    try {
        // Get MongoDB URL from environment secrets
        const mongoUrl = process.env.MONGODB_URL;
        
        if (!mongoUrl) {
            await repondre("❌ MongoDB URL not found in environment secrets. Please set MONGODB_URL in your secrets.");
            return;
        }

        // Connect to MongoDB
        const client = new MongoClient(mongoUrl, {
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000,
        });

        await client.connect();
        const db = client.db('bwm_xmd');
        const collection = db.collection('inform_progress');

        // Get progress document
        const progressDoc = await collection.findOne({ type: 'bulk_messaging' });

        let statusReport;

        if (!progressDoc) {
            statusReport = `┌─── 🔍 INFORM STATUS ───┐
│ Status: ❌ STOPPED
│ Reason: Not initialized
│ Messages sent: 0
│ Last run: Never
└─────────────────────────┘

📝 Note: Use ${prefixe}inform to start bulk messaging`;

        } else {
            const isRunning = progressDoc.isRunning || false;
            const messagesSent = progressDoc.messagesSent || 0;
            const totalContacts = progressDoc.totalContacts || 0;
            const currentIndex = progressDoc.currentIndex || 0;
            const lastUpdated = progressDoc.lastUpdated ? new Date(progressDoc.lastUpdated).toLocaleString() : 'Unknown';
            const startedBy = progressDoc.startedBy || 'Unknown';
            
            // Calculate progress percentage
            const progressPercent = totalContacts > 0 ? 
                ((currentIndex / totalContacts) * 100).toFixed(1) : '0.0';

            // Calculate estimated time remaining if running
            let timeRemaining = 'N/A';
            if (isRunning && totalContacts > 0 && currentIndex > 0) {
                const remainingMessages = totalContacts - currentIndex;
                const avgDelay = 135; // Average of 2-2.5 minutes in seconds
                const remainingSeconds = remainingMessages * avgDelay;
                const hours = Math.floor(remainingSeconds / 3600);
                const minutes = Math.floor((remainingSeconds % 3600) / 60);
                timeRemaining = `${hours}h ${minutes}m`;
            }

            const statusIcon = isRunning ? "🟢 RUNNING" : "🔴 STOPPED";
            const completionStatus = progressDoc.completed ? "✅ Completed" : 
                                   progressDoc.error ? "❌ Error occurred" : 
                                   isRunning ? "⏳ In progress" : "⏹️ Paused/Stopped";

            statusReport = `┌─── 🔍 INFORM STATUS ───┐
│ Status: ${statusIcon}
│ Progress: ${currentIndex}/${totalContacts} (${progressPercent}%)
│ Messages sent: ${messagesSent}
│ Started by: ${startedBy}
│ Last update: ${lastUpdated}
│ Completion: ${completionStatus}
${isRunning ? `│ Est. time left: ${timeRemaining}` : ''}
└─────────────────────────┘

${isRunning ? 
  `🚀 The inform command is currently active!\n📊 Use ${prefixe}informed for detailed progress` : 
  `⏸️ The inform command is not running.\n📝 Use ${prefixe}inform to start bulk messaging`}`;

            // Add error details if there was an error
            if (progressDoc.error) {
                statusReport += `\n\n❌ Last Error: ${progressDoc.error}`;
            }
        }

        // Close MongoDB connection
        await client.close();

        // Send the status report
        await zk.sendMessage(dest, {
            text: statusReport,
            contextInfo: {
                externalAdReply: {
                    title: "🔍 Inform Status Check",
                    body: "BWM-XMD QUANTUM",
                    thumbnailUrl: mybotpic || "https://files.catbox.moe/sd49da.jpg",
                    sourceUrl: "https://github.com/Ibrahim-Adams/BWM-XMD",
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        });

    } catch (error) {
        console.error("Error in informstate command:", error);
        await repondre(`❌ An error occurred while checking inform status: ${error.message}`);
    }
});
