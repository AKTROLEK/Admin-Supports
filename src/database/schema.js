import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dataDir = join(__dirname, '../../data');
if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
}

const dbPath = join(dataDir, 'database.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

// Create tables
export function initializeDatabase() {
    // Voice channel sessions table
    db.exec(`
        CREATE TABLE IF NOT EXISTS voice_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            username TEXT NOT NULL,
            channel_id TEXT NOT NULL,
            channel_name TEXT NOT NULL,
            join_time INTEGER NOT NULL,
            leave_time INTEGER,
            duration INTEGER,
            date TEXT NOT NULL,
            created_at INTEGER DEFAULT (strftime('%s', 'now'))
        )
    `);

    // User interactions table
    db.exec(`
        CREATE TABLE IF NOT EXISTS user_interactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            admin_id TEXT NOT NULL,
            admin_username TEXT NOT NULL,
            target_id TEXT NOT NULL,
            target_username TEXT NOT NULL,
            interaction_type TEXT NOT NULL,
            details TEXT,
            timestamp INTEGER NOT NULL,
            date TEXT NOT NULL,
            created_at INTEGER DEFAULT (strftime('%s', 'now'))
        )
    `);

    // Role changes table
    db.exec(`
        CREATE TABLE IF NOT EXISTS role_changes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            admin_id TEXT NOT NULL,
            admin_username TEXT NOT NULL,
            target_id TEXT NOT NULL,
            target_username TEXT NOT NULL,
            action TEXT NOT NULL,
            role_id TEXT NOT NULL,
            role_name TEXT NOT NULL,
            timestamp INTEGER NOT NULL,
            date TEXT NOT NULL,
            created_at INTEGER DEFAULT (strftime('%s', 'now'))
        )
    `);

    // Channel changes table
    db.exec(`
        CREATE TABLE IF NOT EXISTS channel_changes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            admin_id TEXT NOT NULL,
            admin_username TEXT NOT NULL,
            action TEXT NOT NULL,
            channel_id TEXT NOT NULL,
            channel_name TEXT NOT NULL,
            details TEXT,
            timestamp INTEGER NOT NULL,
            date TEXT NOT NULL,
            created_at INTEGER DEFAULT (strftime('%s', 'now'))
        )
    `);

    // Admin notes table
    db.exec(`
        CREATE TABLE IF NOT EXISTS admin_notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            admin_id TEXT NOT NULL,
            admin_username TEXT NOT NULL,
            author_id TEXT NOT NULL,
            author_username TEXT NOT NULL,
            note TEXT NOT NULL,
            rating INTEGER,
            timestamp INTEGER NOT NULL,
            date TEXT NOT NULL,
            created_at INTEGER DEFAULT (strftime('%s', 'now'))
        )
    `);

    // Message activity table
    db.exec(`
        CREATE TABLE IF NOT EXISTS message_activity (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            username TEXT NOT NULL,
            channel_id TEXT NOT NULL,
            channel_name TEXT NOT NULL,
            message_count INTEGER DEFAULT 1,
            timestamp INTEGER NOT NULL,
            date TEXT NOT NULL,
            created_at INTEGER DEFAULT (strftime('%s', 'now'))
        )
    `);

    // Server actions table
    db.exec(`
        CREATE TABLE IF NOT EXISTS server_actions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            admin_id TEXT NOT NULL,
            admin_username TEXT NOT NULL,
            action_type TEXT NOT NULL,
            target_id TEXT,
            target_name TEXT,
            reason TEXT,
            duration INTEGER,
            timestamp INTEGER NOT NULL,
            date TEXT NOT NULL,
            created_at INTEGER DEFAULT (strftime('%s', 'now'))
        )
    `);

    // Alerts configuration table
    db.exec(`
        CREATE TABLE IF NOT EXISTS alerts_config (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            alert_type TEXT NOT NULL UNIQUE,
            enabled INTEGER DEFAULT 1,
            threshold INTEGER,
            channel_id TEXT,
            roles TEXT,
            created_at INTEGER DEFAULT (strftime('%s', 'now'))
        )
    `);

    // Role permissions table
    db.exec(`
        CREATE TABLE IF NOT EXISTS role_permissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            role_id TEXT NOT NULL UNIQUE,
            role_name TEXT NOT NULL,
            permissions TEXT NOT NULL,
            access_level INTEGER DEFAULT 1,
            created_at INTEGER DEFAULT (strftime('%s', 'now'))
        )
    `);

    // Create indexes for better query performance
    db.exec(`
        CREATE INDEX IF NOT EXISTS idx_voice_sessions_user ON voice_sessions(user_id);
        CREATE INDEX IF NOT EXISTS idx_voice_sessions_date ON voice_sessions(date);
        CREATE INDEX IF NOT EXISTS idx_interactions_admin ON user_interactions(admin_id);
        CREATE INDEX IF NOT EXISTS idx_interactions_date ON user_interactions(date);
        CREATE INDEX IF NOT EXISTS idx_role_changes_admin ON role_changes(admin_id);
        CREATE INDEX IF NOT EXISTS idx_role_changes_date ON role_changes(date);
        CREATE INDEX IF NOT EXISTS idx_channel_changes_admin ON channel_changes(admin_id);
        CREATE INDEX IF NOT EXISTS idx_channel_changes_date ON channel_changes(date);
        CREATE INDEX IF NOT EXISTS idx_admin_notes_admin ON admin_notes(admin_id);
        CREATE INDEX IF NOT EXISTS idx_message_activity_user ON message_activity(user_id);
        CREATE INDEX IF NOT EXISTS idx_message_activity_date ON message_activity(date);
        CREATE INDEX IF NOT EXISTS idx_server_actions_admin ON server_actions(admin_id);
        CREATE INDEX IF NOT EXISTS idx_server_actions_date ON server_actions(date);
    `);

    console.log('✅ Database initialized successfully');
}

export { db };
