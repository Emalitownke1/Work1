
//  [BWM-XMD QUANTUM EDITION]                                           
//  >> A superposition of elegant code states                           
//  >> Collapsed into optimal execution                                
//  >> Scripted by Sir Ibrahim Adams                                    
//  >> Version: 8.3.5-quantum.7

const { autoStartInform } = require('./inform');

// Initialize auto-inform functionality
async function initializeAutoInform(zk) {
    try {
        const shouldAutoStart = process.env.INFORM?.toLowerCase() === 'true';
        
        if (shouldAutoStart) {
            console.log('🔍 INFORM environment variable detected as TRUE');
            console.log('⏰ Waiting 10 seconds before auto-starting inform...');
            
            // Wait a bit for the bot to fully initialize
            setTimeout(async () => {
                try {
                    await autoStartInform(zk);
                } catch (error) {
                    console.error('❌ Error in auto-inform initialization:', error);
                }
            }, 10000); // 10 second delay
        } else {
            console.log('ℹ️ INFORM auto-start disabled (set INFORM=TRUE in environment to enable)');
        }
    } catch (error) {
        console.error('❌ Error checking INFORM environment variable:', error);
    }
}

module.exports = { initializeAutoInform };
