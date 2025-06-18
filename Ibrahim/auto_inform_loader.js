
//  [BWM-XMD QUANTUM EDITION]                                           
//  >> A superposition of elegant code states                           
//  >> Collapsed into optimal execution                                
//  >> Scripted by Sir Ibrahim Adams                                    
//  >> Version: 8.3.5-quantum.7

const { initializeAutoInform } = require('../adams/auto_inform_init');

// This function should be called after the bot connects to WhatsApp
async function loadAutoInform(zk) {
    try {
        console.log('🚀 Loading auto-inform functionality...');
        await initializeAutoInform(zk);
        console.log('✅ Auto-inform loader initialized successfully');
    } catch (error) {
        console.error('❌ Error loading auto-inform:', error);
    }
}

module.exports = { loadAutoInform };
