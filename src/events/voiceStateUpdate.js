import { voiceSessions } from '../database/queries.js';
import { formatDate } from '../utils/helpers.js';

export default {
    name: 'voiceStateUpdate',
    execute: async (oldState, newState) => {
        const userId = newState.id;
        const username = newState.member.user.username;
        
        // User joined a voice channel
        if (!oldState.channelId && newState.channelId) {
            const joinTime = Date.now();
            const date = formatDate(joinTime);
            
            voiceSessions.create(
                userId,
                username,
                newState.channelId,
                newState.channel.name,
                joinTime,
                date
            );
            
            console.log(`📞 ${username} joined voice channel: ${newState.channel.name}`);
        }
        
        // User left a voice channel
        if (oldState.channelId && !newState.channelId) {
            const activeSession = voiceSessions.getActive(userId);
            
            if (activeSession) {
                const leaveTime = Date.now();
                const duration = leaveTime - activeSession.join_time;
                
                voiceSessions.update(activeSession.id, leaveTime, duration);
                
                console.log(`📞 ${username} left voice channel: ${oldState.channel.name} (Duration: ${Math.floor(duration / 60000)} min)`);
            }
        }
        
        // User switched voice channels
        if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
            // Close old session
            const activeSession = voiceSessions.getActive(userId);
            if (activeSession) {
                const leaveTime = Date.now();
                const duration = leaveTime - activeSession.join_time;
                voiceSessions.update(activeSession.id, leaveTime, duration);
            }
            
            // Open new session
            const joinTime = Date.now();
            const date = formatDate(joinTime);
            voiceSessions.create(
                userId,
                username,
                newState.channelId,
                newState.channel.name,
                joinTime,
                date
            );
            
            console.log(`📞 ${username} switched from ${oldState.channel.name} to ${newState.channel.name}`);
        }
    }
};
