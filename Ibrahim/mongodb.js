
//  [BWM-XMD QUANTUM EDITION]                                           
//  >> A superposition of elegant code states                           
//  >> Collapsed into optimal execution                                
//  >> Scripted by Sir Ibrahim Adams                                    
//  >> Version: 8.3.5-quantum.7

const { MongoClient } = require('mongodb');
const config = require('../config');

let client = null;
let db = null;

const connectMongoDB = async () => {
    try {
        if (!config.MONGO_DB) {
            throw new Error('MONGO_DB environment variable not set');
        }

        if (client && client.topology && client.topology.isConnected()) {
            return { success: true, message: 'Already connected to MongoDB' };
        }

        client = new MongoClient(config.MONGO_DB, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 10000,
        });

        await client.connect();
        db = client.db();
        
        // Test the connection
        await client.db("admin").command({ ping: 1 });
        
        return { 
            success: true, 
            message: 'Successfully connected to MongoDB',
            client: client,
            db: db
        };
    } catch (error) {
        return { 
            success: false, 
            message: `MongoDB connection failed: ${error.message}`,
            error: error
        };
    }
};

const checkMongoDBConnection = async () => {
    try {
        if (!config.MONGO_DB) {
            return { 
                success: false, 
                message: 'MONGO_DB environment variable not configured' 
            };
        }

        if (!client) {
            return await connectMongoDB();
        }

        // Check if client is still connected
        if (client.topology && client.topology.isConnected()) {
            // Test with a ping
            await client.db("admin").command({ ping: 1 });
            return { 
                success: true, 
                message: 'MongoDB is connected and responsive' 
            };
        } else {
            return await connectMongoDB();
        }
    } catch (error) {
        return { 
            success: false, 
            message: `MongoDB connection check failed: ${error.message}` 
        };
    }
};

const closeMongoDB = async () => {
    try {
        if (client) {
            await client.close();
            client = null;
            db = null;
            return { success: true, message: 'MongoDB connection closed' };
        }
        return { success: true, message: 'No active MongoDB connection' };
    } catch (error) {
        return { 
            success: false, 
            message: `Error closing MongoDB connection: ${error.message}` 
        };
    }
};

module.exports = {
    connectMongoDB,
    checkMongoDBConnection,
    closeMongoDB,
    getClient: () => client,
    getDB: () => db
};
