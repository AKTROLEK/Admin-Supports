export default {
    name: 'ready',
    once: true,
    execute: (client) => {
        console.log(`✅ Bot is online as ${client.user.tag}`);
        console.log(`📊 Serving ${client.guilds.cache.size} server(s)`);
        console.log(`👥 Monitoring ${client.users.cache.size} user(s)`);
        
        // Set bot status
        client.user.setPresence({
            activities: [{
                name: 'Admin Statistics 📊',
                type: 3 // Watching
            }],
            status: 'online'
        });
    }
};
