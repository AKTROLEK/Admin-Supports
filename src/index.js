import { Client, Collection, GatewayIntentBits, REST, Routes } from 'discord.js';
import { config } from 'dotenv';
import { readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { initializeDatabase } from './database/schema.js';
import { setLocale } from './locales/index.js';

// Load environment variables
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize database
initializeDatabase();

// Set default language
setLocale(process.env.DEFAULT_LANGUAGE || 'ar');

// Create Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessageReactions
    ]
});

// Initialize commands collection
client.commands = new Collection();

// Load commands from all subdirectories
async function loadCommands() {
    const commands = [];
    const commandsPath = join(__dirname, 'commands');
    const commandFolders = readdirSync(commandsPath);
    
    for (const folder of commandFolders) {
        const folderPath = join(commandsPath, folder);
        const commandFiles = readdirSync(folderPath).filter(file => file.endsWith('.js'));
        
        for (const file of commandFiles) {
            const filePath = join(folderPath, file);
            const command = await import(`file://${filePath}`);
            
            if (command.default && 'data' in command.default && 'execute' in command.default) {
                client.commands.set(command.default.data.name, command.default);
                commands.push(command.default.data.toJSON());
                console.log(`✅ Loaded command: ${command.default.data.name}`);
            } else {
                console.log(`⚠️  Skipping invalid command file: ${file}`);
            }
        }
    }
    
    return commands;
}

// Load events
async function loadEvents() {
    const eventsPath = join(__dirname, 'events');
    const eventFiles = readdirSync(eventsPath).filter(file => file.endsWith('.js'));
    
    for (const file of eventFiles) {
        const filePath = join(eventsPath, file);
        const event = await import(`file://${filePath}`);
        
        if (event.default && 'name' in event.default && 'execute' in event.default) {
            if (event.default.once) {
                client.once(event.default.name, (...args) => event.default.execute(...args));
            } else {
                client.on(event.default.name, (...args) => event.default.execute(...args));
            }
            console.log(`✅ Loaded event: ${event.default.name}`);
        } else {
            console.log(`⚠️  Skipping invalid event file: ${file}`);
        }
    }
}

// Register commands with Discord
async function registerCommands(commands) {
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    
    try {
        console.log(`🔄 Started refreshing ${commands.length} application (/) commands.`);
        
        if (process.env.GUILD_ID) {
            // Register commands for a specific guild (faster for development)
            const data = await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
                { body: commands }
            );
            console.log(`✅ Successfully registered ${data.length} guild commands.`);
        } else {
            // Register commands globally
            const data = await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: commands }
            );
            console.log(`✅ Successfully registered ${data.length} global commands.`);
        }
    } catch (error) {
        console.error('❌ Error registering commands:', error);
    }
}

// Automatic backup system
async function setupAutoBackup() {
    const backupInterval = parseInt(process.env.BACKUP_INTERVAL) || 86400000; // Default: 24 hours
    const { createBackup } = await import('./utils/helpers.js');
    
    setInterval(() => {
        const result = createBackup();
        
        if (result.success) {
            console.log(`✅ Automatic backup created: backup-${result.timestamp}.db`);
        } else {
            console.error('❌ Automatic backup failed:', result.error);
        }
    }, backupInterval);
    
    console.log(`✅ Automatic backup enabled (interval: ${backupInterval / 3600000} hours)`);
}

// Initialize bot
async function init() {
    console.log('🚀 Starting FiveM Admin Statistics Bot...');
    
    // Load commands and events
    const commands = await loadCommands();
    await loadEvents();
    
    // Register commands with Discord
    await registerCommands(commands);
    
    // Setup automatic backup
    await setupAutoBackup();
    
    // Login to Discord
    await client.login(process.env.DISCORD_TOKEN);
}

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down bot...');
    client.destroy();
    process.exit(0);
});

process.on('unhandledRejection', error => {
    console.error('❌ Unhandled promise rejection:', error);
});

// Start the bot
init().catch(error => {
    console.error('❌ Failed to start bot:', error);
    process.exit(1);
});
