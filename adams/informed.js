
//  [BWM-XMD QUANTUM EDITION]                                           
//  >> A superposition of elegant code states                           
//  >> Collapsed into optimal execution                                
//  >> Scripted by Sir Ibrahim Adams                                    
//  >> Version: 8.3.5-quantum.7

const { adams } = require("../Ibrahim/adams");
const { MongoClient } = require('mongodb');

adams({
    nomCom: "informed",
    categorie: "Messaging",
    reaction: "📊"
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

        if (!progressDoc) {
            await repondre("📊 No messaging activity found.\n\n❌ The .inform command has not been started yet.");
            await client.close();
            return;
        }

        // Calculate progress percentage
        const progressPercent = progressDoc.totalContacts > 0 ? 
            ((progressDoc.currentIndex / progressDoc.totalContacts) * 100).toFixed(2) : 0;

        // Determine status
        let status = "❓ Unknown";
        if (progressDoc.isRunning) {
            status = "🟢 Running";
        } else if (progressDoc.completed) {
            status = "✅ Completed";
        } else if (progressDoc.error) {
            status = "❌ Error";
        } else {
            status = "⏸️ Paused";
        }

        // Calculate estimated time remaining (if running)
        let estimatedTimeRemaining = "";
        if (progressDoc.isRunning && progressDoc.currentIndex > 0) {
            const remainingContacts = progressDoc.totalContacts - progressDoc.currentIndex;
            const avgTimePerMessage = 135000; // Average of 2-2.5 minutes in milliseconds
            const estimatedMs = remainingContacts * avgTimePerMessage;
            const estimatedHours = Math.floor(estimatedMs / (1000 * 60 * 60));
            const estimatedMinutes = Math.floor((estimatedMs % (1000 * 60 * 60)) / (1000 * 60));
            
            if (estimatedHours > 0) {
                estimatedTimeRemaining = `\n⏱️ Estimated time remaining: ${estimatedHours}h ${estimatedMinutes}m`;
            } else {
                estimatedTimeRemaining = `\n⏱️ Estimated time remaining: ${estimatedMinutes}m`;
            }
        }

        // Create comprehensive progress report
        const progressReport = `
╭─────────────────────────╮
│    📊 MESSAGING PROGRESS REPORT    │
╰─────────────────────────╯

┌─── 📈 STATISTICS ───┐
│ Status: ${status}
│ 📨 Messages Sent: ${progressDoc.messagesSent || 0}
│ 📍 Current Position: ${progressDoc.currentIndex || 0}
│ 👥 Total Contacts: ${progressDoc.totalContacts || 0}
│ 📊 Progress: ${progressPercent}%
└─────────────────────────────┘

┌─── ⏰ TIMING INFO ───┐
│ 🚀 Started By: ${progressDoc.startedBy || 'Unknown'}
│ 📅 Last Updated: ${progressDoc.lastUpdated ? new Date(progressDoc.lastUpdated).toLocaleString() : 'Never'}${progressDoc.completed ? `\n│ ✅ Completed At: ${new Date(progressDoc.completedAt).toLocaleString()}` : ''}${estimatedTimeRemaining}
└─────────────────────────────┘

${progressDoc.error ? `┌─── ❌ ERROR INFO ───┐\n│ Error: ${progressDoc.error}\n└─────────────────────────────┘\n` : ''}
┌─── 🔧 COMMAND DETAILS ───┐
│ 🤖 Bot: BWM-XMD QUANTUM
│ 👨‍💻 Developer: Ibrahim Adams
│ 🏷️ Prefix: ${prefixe || '.'}
│ 👤 Requested by: ${nomAuteurMessage || 'User'}
└─────────────────────────────┘

╭─────────────────────────╮
│  📊 Progress monitoring complete!  │
╰─────────────────────────╯`;

        // Send the progress report
        await zk.sendMessage(dest, {
            text: progressReport,
            contextInfo: {
                externalAdReply: {
                    title: "📊 Messaging Progress Report",
                    body: `${progressDoc.messagesSent || 0} messages sent so far`,
                    thumbnailUrl: mybotpic || "https://files.catbox.moe/sd49da.jpg",
                    sourceUrl: "https://github.com/Ibrahim-Adams/BWM-XMD",
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        });

        await client.close();

    } catch (error) {
        console.error("Error in informed command:", error);
        await repondre(`❌ An error occurred while checking progress: ${error.message}`);
    }
});
