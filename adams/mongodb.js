
//  [BWM-XMD QUANTUM EDITION]                                           
//  >> A superposition of elegant code states                           
//  >> Collapsed into optimal execution                                
//  >> Scripted by Sir Ibrahim Adams                                    
//  >> Version: 8.3.5-quantum.7

const { adams } = require("../Ibrahim/adams");
const { MongoClient } = require('mongodb');

adams({
    nomCom: "mongodb",
    categorie: "Database",
    reaction: "🗄️"
}, async (dest, zk, commandeOptions) => {
    const { ms, repondre, prefixe, nomAuteurMessage, mybotpic } = commandeOptions;

    try {
        // Get MongoDB URL from environment secrets
        const mongoUrl = process.env.MONGODB_URL;
        
        if (!mongoUrl) {
            await repondre("❌ MongoDB URL not found in environment secrets. Please set MONGODB_URL in your secrets.");
            return;
        }

        // Test database connection
        const client = new MongoClient(mongoUrl, {
            serverSelectionTimeoutMS: 10000, // 10 second timeout
            connectTimeoutMS: 10000,
        });

        let connectionStatus = "❌ Unreachable";
        let databaseInfo = "";
        let collectionsInfo = "";
        let serverInfo = "";

        try {
            // Connect to MongoDB
            await client.connect();
            connectionStatus = "✅ Connected Successfully";

            // Get database name from URL or use default
            const dbName = mongoUrl.split('/')[3]?.split('?')[0] || 'test';
            const database = client.db(dbName);
            
            // Get collections list
            const collections = await database.listCollections().toArray();
            
            // Get database stats (this should work with standard permissions)
            let dbStats;
            try {
                dbStats = await database.stats();
            } catch (statsError) {
                console.log('Stats permission denied, using basic info');
                dbStats = { collections: collections.length, dataSize: 0, storageSize: 0, indexes: 0, indexSize: 0, objects: 0 };
            }
            
            // Try to get server info with fallback
            let serverVersion = 'Unknown';
            try {
                const admin = client.db().admin();
                const buildInfo = await admin.command({ buildInfo: 1 });
                serverVersion = buildInfo.version;
            } catch (adminError) {
                console.log('Admin command denied, using basic connection info');
            }
            
            serverInfo = `
┌─── 🖥️ SERVER INFO ───┐
│ 🔹 MongoDB Version: ${serverVersion}
│ 🔹 Database: ${dbName}
│ 🔹 Connection: Established
│ 🔹 Collections: ${collections.length}
└─────────────────────────┘`;

            databaseInfo = `
┌─── 📊 DATABASE STATS ───┐
│ 🔸 Database: ${dbName}
│ 🔸 Collections: ${dbStats.collections}
│ 🔸 Data Size: ${(dbStats.dataSize / 1024 / 1024).toFixed(2)} MB
│ 🔸 Storage Size: ${(dbStats.storageSize / 1024 / 1024).toFixed(2)} MB
│ 🔸 Indexes: ${dbStats.indexes}
│ 🔸 Index Size: ${(dbStats.indexSize / 1024 / 1024).toFixed(2)} MB
│ 🔸 Objects: ${dbStats.objects}
└───────────────────────────┘`;

            if (collections.length > 0) {
                collectionsInfo = "\n┌─── 📚 COLLECTIONS ───┐\n";
                for (let i = 0; i < Math.min(collections.length, 10); i++) {
                    const collection = collections[i];
                    try {
                        const count = await database.collection(collection.name).countDocuments();
                        collectionsInfo += `│ 📄 ${collection.name}: ${count} documents\n`;
                    } catch (err) {
                        collectionsInfo += `│ 📄 ${collection.name}: Unable to count\n`;
                    }
                }
                if (collections.length > 10) {
                    collectionsInfo += `│ ... and ${collections.length - 10} more collections\n`;
                }
                collectionsInfo += "└─────────────────────────┘";
            } else {
                collectionsInfo = "\n┌─── 📚 COLLECTIONS ───┐\n│ No collections found\n└─────────────────────────┘";
            }

        } catch (error) {
            connectionStatus = `❌ Connection Failed: ${error.message}`;
        } finally {
            await client.close();
        }

        // Create comprehensive MongoDB report
        const mongoReport = `
╭─────────────────────────╮
│    🗄️ MONGODB DATABASE STATUS    │
╰─────────────────────────╯

┌─── 🔗 CONNECTION STATUS ───┐
│ Status: ${connectionStatus}
│ 🌐 Database URL: ${mongoUrl.replace(/\/\/([^:]+):([^@]+)@/, '//[USERNAME]:[PASSWORD]@')}
│ ⏰ Checked: ${new Date().toLocaleString()}
└───────────────────────────────┘
${serverInfo}
${databaseInfo}
${collectionsInfo}

┌─── 🔧 COMMAND DETAILS ───┐
│ 🤖 Bot: BWM-XMD QUANTUM
│ 👨‍💻 Developer: Ibrahim Adams
│ 🏷️ Prefix: ${prefixe || '.'}
│ 👤 Requested by: ${nomAuteurMessage || 'User'}
└─────────────────────────────┘

╭─────────────────────────╮
│  📊 Database monitoring complete!  │
╰─────────────────────────╯`;

        // Send the MongoDB report
        await zk.sendMessage(dest, {
            text: mongoReport,
            contextInfo: {
                externalAdReply: {
                    title: "🗄️ MongoDB Database Status",
                    body: "Real-time database connectivity and information",
                    thumbnailUrl: mybotpic || "https://files.catbox.moe/sd49da.jpg",
                    sourceUrl: "https://github.com/Ibrahim-Adams/BWM-XMD",
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        });

    } catch (error) {
        console.error("Error in mongodb command:", error);
        await repondre(`❌ An error occurred while checking MongoDB status: ${error.message}`);
    }
});
