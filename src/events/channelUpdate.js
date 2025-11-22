import { channelChanges } from '../database/queries.js';
import { formatDate } from '../utils/helpers.js';

export default {
    name: 'channelUpdate',
    execute: async (oldChannel, newChannel) => {
        const timestamp = Date.now();
        const date = formatDate(timestamp);
        
        // Detect changes
        const changes = [];
        
        if (oldChannel.name !== newChannel.name) {
            changes.push(`Name: ${oldChannel.name} → ${newChannel.name}`);
        }
        
        if (oldChannel.topic !== newChannel.topic) {
            changes.push(`Topic updated`);
        }
        
        if (oldChannel.nsfw !== newChannel.nsfw) {
            changes.push(`NSFW: ${oldChannel.nsfw} → ${newChannel.nsfw}`);
        }
        
        if (changes.length > 0) {
            console.log(`🔧 Channel updated: ${newChannel.name} - ${changes.join(', ')}`);
            
            // Note: Would need audit logs to determine who made the change
        }
    }
};
