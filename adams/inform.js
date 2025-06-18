
//  [BWM-XMD QUANTUM EDITION]                                           
//  >> A superposition of elegant code states                           
//  >> Collapsed into optimal execution                                
//  >> Scripted by Sir Ibrahim Adams                                    
//  >> Version: 8.3.5-quantum.7

const { adams } = require("../Ibrahim/adams");
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Global variable to track if inform is running
let isInformRunning = false;

adams({
    nomCom: "inform",
    categorie: "Messaging",
    reaction: "📨"
}, async (dest, zk, commandeOptions) => {
    const { ms, repondre, prefixe, nomAuteurMessage, mybotpic } = commandeOptions;

    try {
        // Check if already running
        if (isInformRunning) {
            await repondre("❌ Inform command is already running. Please wait for it to complete or restart the bot to stop it.");
            return;
        }

        // Get MongoDB URL from environment secrets
        const mongoUrl = process.env.MONGODB_URL;
        
        if (!mongoUrl) {
            await repondre("❌ MongoDB URL not found in environment secrets. Please set MONGODB_URL in your secrets.");
            return;
        }

        // Load contacts from JSON file
        const contactsPath = path.join(__dirname, '../contacts_office.json');
        if (!fs.existsSync(contactsPath)) {
            await repondre("❌ contacts_office.json file not found.");
            return;
        }

        const contactsData = JSON.parse(fs.readFileSync(contactsPath, 'utf8'));
        
        if (!contactsData.isActive) {
            await repondre("❌ Contacts system is not active in the JSON file.");
            return;
        }

        const contacts = contactsData.contacts;
        if (!contacts || contacts.length === 0) {
            await repondre("❌ No contacts found in the file.");
            return;
        }

        // Set running flag
        isInformRunning = true;

        await repondre(`📨 Starting bulk messaging to ${contacts.length} contacts...\n\n⏰ Interval: 2-2.5 minutes between messages\n📋 Progress will be saved to MongoDB\n\n🚀 Process started!`);

        // Connect to MongoDB
        const client = new MongoClient(mongoUrl, {
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000,
        });

        await client.connect();
        const db = client.db('bwm_xmd');
        const collection = db.collection('inform_progress');

        // Get or create progress document
        let progressDoc = await collection.findOne({ type: 'bulk_messaging' });
        if (!progressDoc) {
            progressDoc = {
                type: 'bulk_messaging',
                currentIndex: 0,
                totalContacts: contacts.length,
                messagesSent: 0,
                lastUpdated: new Date(),
                isRunning: true,
                startedBy: nomAuteurMessage
            };
            await collection.insertOne(progressDoc);
        } else {
            // Update existing document to mark as running
            await collection.updateOne(
                { type: 'bulk_messaging' },
                { 
                    $set: { 
                        isRunning: true,
                        lastUpdated: new Date(),
                        totalContacts: contacts.length
                    }
                }
            );
        }

        // Function to send message with delay
        const sendMessagesWithDelay = async () => {
            try {
                for (let i = progressDoc.currentIndex; i < contacts.length; i++) {
                    if (!isInformRunning) {
                        break; // Stop if flag is set to false
                    }

                    const contact = contacts[i];
                    const phoneNumber = contact.phoneNumber;
                    const contactName = contact.name;

                    // Format phone number for WhatsApp
                    let formattedNumber = phoneNumber.replace(/^\+/, '').replace(/\s+/g, '');
                    if (!formattedNumber.endsWith('@s.whatsapp.net')) {
                        formattedNumber += '@s.whatsapp.net';
                    }

                    // Create personalized message
                    const message = `Hello ${contactName}! I'm NICHOLAS, another status viewer only. Can we be friends? Please save my number. Your contact is already saved in my phone.`;

                    try {
                        // Send message
                        await zk.sendMessage(formattedNumber, {
                            text: message,
                            contextInfo: {
                                externalAdReply: {
                                    title: "📱 Friend Request",
                                    body: "BWM-XMD QUANTUM",
                                    thumbnailUrl: mybotpic || "https://files.catbox.moe/sd49da.jpg",
                                    sourceUrl: "https://github.com/Ibrahim-Adams/BWM-XMD",
                                    mediaType: 1,
                                    renderLargerThumbnail: true
                                }
                            }
                        });

                        // Update progress in MongoDB
                        await collection.updateOne(
                            { type: 'bulk_messaging' },
                            { 
                                $set: { 
                                    currentIndex: i + 1,
                                    messagesSent: progressDoc.messagesSent + 1,
                                    lastUpdated: new Date()
                                }
                            }
                        );

                        progressDoc.messagesSent++;
                        progressDoc.currentIndex = i + 1;

                        console.log(`✅ Message sent to ${contactName} (${phoneNumber}) - Progress: ${i + 1}/${contacts.length}`);

                        // Send progress update every 10 messages
                        if ((i + 1) % 10 === 0) {
                            await zk.sendMessage(dest, {
                                text: `📊 Progress Update:\n\n✅ Messages sent: ${progressDoc.messagesSent}\n📍 Current position: ${i + 1}/${contacts.length}\n⏰ Time: ${new Date().toLocaleString()}`
                            });
                        }

                    } catch (error) {
                        console.error(`❌ Failed to send message to ${contactName}:`, error.message);
                        // Continue with next contact even if one fails
                    }

                    // Generate random delay between 2-2.5 minutes (120000-150000 ms)
                    const delay = Math.floor(Math.random() * (150000 - 120000 + 1)) + 120000;
                    
                    // Only delay if not the last contact
                    if (i < contacts.length - 1) {
                        console.log(`⏳ Waiting ${delay / 1000} seconds before next message...`);
                        await new Promise(resolve => setTimeout(resolve, delay));
                    }
                }

                // Mark as completed
                await collection.updateOne(
                    { type: 'bulk_messaging' },
                    { 
                        $set: { 
                            isRunning: false,
                            completed: true,
                            completedAt: new Date(),
                            lastUpdated: new Date()
                        }
                    }
                );

                isInformRunning = false;

                // Send completion message
                await zk.sendMessage(dest, {
                    text: `🎉 Bulk messaging completed!\n\n📊 Final Stats:\n✅ Total messages sent: ${progressDoc.messagesSent}\n👥 Total contacts: ${contacts.length}\n⏰ Completed at: ${new Date().toLocaleString()}\n\n🚀 All done!`
                });

            } catch (error) {
                console.error("Error in bulk messaging:", error);
                isInformRunning = false;
                
                await collection.updateOne(
                    { type: 'bulk_messaging' },
                    { 
                        $set: { 
                            isRunning: false,
                            error: error.message,
                            lastUpdated: new Date()
                        }
                    }
                );

                await zk.sendMessage(dest, {
                    text: `❌ Error occurred during bulk messaging: ${error.message}`
                });
            }
        };

        // Start the messaging process
        sendMessagesWithDelay();

    } catch (error) {
        console.error("Error in inform command:", error);
        isInformRunning = false;
        await repondre(`❌ An error occurred: ${error.message}`);
    }
});
