import { messageActivity } from '../database/queries.js';
import { formatDate } from '../utils/helpers.js';

export default {
    name: 'messageCreate',
    execute: async (message) => {
        // Ignore bot messages
        if (message.author.bot) return;
        
        // Ignore DMs
        if (!message.guild) return;
        
        const timestamp = Date.now();
        const date = formatDate(timestamp);
        
        try {
            messageActivity.increment(
                message.author.id,
                message.author.username,
                message.channel.id,
                message.channel.name,
                timestamp,
                date
            );
        } catch (error) {
            console.error('Error tracking message activity:', error);
        }
    }
};
