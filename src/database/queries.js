import { db } from './schema.js';

// Voice Sessions
export const voiceSessions = {
    create: (userId, username, channelId, channelName, joinTime, date) => {
        const stmt = db.prepare(`
            INSERT INTO voice_sessions (user_id, username, channel_id, channel_name, join_time, date)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        return stmt.run(userId, username, channelId, channelName, joinTime, date);
    },

    update: (id, leaveTime, duration) => {
        const stmt = db.prepare(`
            UPDATE voice_sessions 
            SET leave_time = ?, duration = ?
            WHERE id = ?
        `);
        return stmt.run(leaveTime, duration, id);
    },

    getActive: (userId) => {
        const stmt = db.prepare(`
            SELECT * FROM voice_sessions 
            WHERE user_id = ? AND leave_time IS NULL
            ORDER BY join_time DESC LIMIT 1
        `);
        return stmt.get(userId);
    },

    getByDateRange: (userId, startDate, endDate) => {
        const stmt = db.prepare(`
            SELECT * FROM voice_sessions 
            WHERE user_id = ? AND date BETWEEN ? AND ?
            ORDER BY join_time DESC
        `);
        return stmt.all(userId, startDate, endDate);
    },

    getTotalDuration: (userId, startDate, endDate) => {
        const stmt = db.prepare(`
            SELECT COALESCE(SUM(duration), 0) as total_duration
            FROM voice_sessions 
            WHERE user_id = ? AND date BETWEEN ? AND ? AND duration IS NOT NULL
        `);
        return stmt.get(userId, startDate, endDate);
    }
};

// User Interactions
export const userInteractions = {
    create: (adminId, adminUsername, targetId, targetUsername, type, details, timestamp, date) => {
        const stmt = db.prepare(`
            INSERT INTO user_interactions 
            (admin_id, admin_username, target_id, target_username, interaction_type, details, timestamp, date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        return stmt.run(adminId, adminUsername, targetId, targetUsername, type, details, timestamp, date);
    },

    getByAdmin: (adminId, startDate, endDate) => {
        const stmt = db.prepare(`
            SELECT * FROM user_interactions 
            WHERE admin_id = ? AND date BETWEEN ? AND ?
            ORDER BY timestamp DESC
        `);
        return stmt.all(adminId, startDate, endDate);
    },

    countByAdmin: (adminId, startDate, endDate) => {
        const stmt = db.prepare(`
            SELECT COUNT(*) as count FROM user_interactions 
            WHERE admin_id = ? AND date BETWEEN ? AND ?
        `);
        return stmt.get(adminId, startDate, endDate);
    }
};

// Role Changes
export const roleChanges = {
    create: (adminId, adminUsername, targetId, targetUsername, action, roleId, roleName, timestamp, date) => {
        const stmt = db.prepare(`
            INSERT INTO role_changes 
            (admin_id, admin_username, target_id, target_username, action, role_id, role_name, timestamp, date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        return stmt.run(adminId, adminUsername, targetId, targetUsername, action, roleId, roleName, timestamp, date);
    },

    getByAdmin: (adminId, startDate, endDate) => {
        const stmt = db.prepare(`
            SELECT * FROM role_changes 
            WHERE admin_id = ? AND date BETWEEN ? AND ?
            ORDER BY timestamp DESC
        `);
        return stmt.all(adminId, startDate, endDate);
    },

    countByAdmin: (adminId, startDate, endDate) => {
        const stmt = db.prepare(`
            SELECT COUNT(*) as count FROM role_changes 
            WHERE admin_id = ? AND date BETWEEN ? AND ?
        `);
        return stmt.get(adminId, startDate, endDate);
    }
};

// Channel Changes
export const channelChanges = {
    create: (adminId, adminUsername, action, channelId, channelName, details, timestamp, date) => {
        const stmt = db.prepare(`
            INSERT INTO channel_changes 
            (admin_id, admin_username, action, channel_id, channel_name, details, timestamp, date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        return stmt.run(adminId, adminUsername, action, channelId, channelName, details, timestamp, date);
    },

    getByAdmin: (adminId, startDate, endDate) => {
        const stmt = db.prepare(`
            SELECT * FROM channel_changes 
            WHERE admin_id = ? AND date BETWEEN ? AND ?
            ORDER BY timestamp DESC
        `);
        return stmt.all(adminId, startDate, endDate);
    }
};

// Admin Notes
export const adminNotes = {
    create: (adminId, adminUsername, authorId, authorUsername, note, rating, timestamp, date) => {
        const stmt = db.prepare(`
            INSERT INTO admin_notes 
            (admin_id, admin_username, author_id, author_username, note, rating, timestamp, date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        return stmt.run(adminId, adminUsername, authorId, authorUsername, note, rating, timestamp, date);
    },

    getByAdmin: (adminId) => {
        const stmt = db.prepare(`
            SELECT * FROM admin_notes 
            WHERE admin_id = ?
            ORDER BY timestamp DESC
        `);
        return stmt.all(adminId);
    },

    getAll: () => {
        const stmt = db.prepare(`
            SELECT * FROM admin_notes 
            ORDER BY timestamp DESC
        `);
        return stmt.all();
    }
};

// Message Activity
export const messageActivity = {
    increment: (userId, username, channelId, channelName, timestamp, date) => {
        const stmt = db.prepare(`
            INSERT INTO message_activity 
            (user_id, username, channel_id, channel_name, message_count, timestamp, date)
            VALUES (?, ?, ?, ?, 1, ?, ?)
        `);
        return stmt.run(userId, username, channelId, channelName, timestamp, date);
    },

    getByUser: (userId, startDate, endDate) => {
        const stmt = db.prepare(`
            SELECT * FROM message_activity 
            WHERE user_id = ? AND date BETWEEN ? AND ?
            ORDER BY timestamp DESC
        `);
        return stmt.all(userId, startDate, endDate);
    },

    getTotalMessages: (userId, startDate, endDate) => {
        const stmt = db.prepare(`
            SELECT COALESCE(SUM(message_count), 0) as total_messages
            FROM message_activity 
            WHERE user_id = ? AND date BETWEEN ? AND ?
        `);
        return stmt.get(userId, startDate, endDate);
    }
};

// Server Actions
export const serverActions = {
    create: (adminId, adminUsername, actionType, targetId, targetName, reason, duration, timestamp, date) => {
        const stmt = db.prepare(`
            INSERT INTO server_actions 
            (admin_id, admin_username, action_type, target_id, target_name, reason, duration, timestamp, date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        return stmt.run(adminId, adminUsername, actionType, targetId, targetName, reason, duration, timestamp, date);
    },

    getByAdmin: (adminId, startDate, endDate) => {
        const stmt = db.prepare(`
            SELECT * FROM server_actions 
            WHERE admin_id = ? AND date BETWEEN ? AND ?
            ORDER BY timestamp DESC
        `);
        return stmt.all(adminId, startDate, endDate);
    },

    countByType: (adminId, actionType, startDate, endDate) => {
        const stmt = db.prepare(`
            SELECT COUNT(*) as count FROM server_actions 
            WHERE admin_id = ? AND action_type = ? AND date BETWEEN ? AND ?
        `);
        return stmt.get(adminId, actionType, startDate, endDate);
    }
};

// Alerts Config
export const alertsConfig = {
    create: (alertType, enabled, threshold, channelId, roles) => {
        const stmt = db.prepare(`
            INSERT OR REPLACE INTO alerts_config 
            (alert_type, enabled, threshold, channel_id, roles)
            VALUES (?, ?, ?, ?, ?)
        `);
        return stmt.run(alertType, enabled, threshold, channelId, roles);
    },

    get: (alertType) => {
        const stmt = db.prepare(`
            SELECT * FROM alerts_config WHERE alert_type = ?
        `);
        return stmt.get(alertType);
    },

    getAll: () => {
        const stmt = db.prepare(`SELECT * FROM alerts_config`);
        return stmt.all();
    }
};

// Role Permissions
export const rolePermissions = {
    create: (roleId, roleName, permissions, accessLevel) => {
        const stmt = db.prepare(`
            INSERT OR REPLACE INTO role_permissions 
            (role_id, role_name, permissions, access_level)
            VALUES (?, ?, ?, ?)
        `);
        return stmt.run(roleId, roleName, permissions, accessLevel);
    },

    get: (roleId) => {
        const stmt = db.prepare(`
            SELECT * FROM role_permissions WHERE role_id = ?
        `);
        return stmt.get(roleId);
    },

    getAll: () => {
        const stmt = db.prepare(`SELECT * FROM role_permissions ORDER BY access_level DESC`);
        return stmt.all();
    }
};
