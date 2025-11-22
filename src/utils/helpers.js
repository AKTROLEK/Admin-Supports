import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync, copyFileSync, readdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Date formatting
export function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toISOString().split('T')[0];
}

export function formatDateTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('ar-SA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

export function formatDuration(milliseconds) {
    if (!milliseconds || milliseconds < 0) return '0 دقيقة';
    
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
        const remainingHours = hours % 24;
        return `${days} يوم${days > 1 ? '' : ''} ${remainingHours > 0 ? `و ${remainingHours} ساعة` : ''}`;
    }
    if (hours > 0) {
        const remainingMinutes = minutes % 60;
        return `${hours} ساعة${hours > 1 ? '' : ''} ${remainingMinutes > 0 ? `و ${remainingMinutes} دقيقة` : ''}`;
    }
    if (minutes > 0) {
        return `${minutes} دقيقة${minutes > 1 ? '' : ''}`;
    }
    return `${seconds} ثانية${seconds > 1 ? '' : ''}`;
}

// Date range helpers
export function getDateRange(period) {
    const now = new Date();
    const endDate = formatDate(now);
    let startDate;
    
    switch(period) {
        case 'daily':
            startDate = endDate;
            break;
        case 'weekly':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            startDate = formatDate(weekAgo);
            break;
        case 'monthly':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            startDate = formatDate(monthAgo);
            break;
        default:
            startDate = endDate;
    }
    
    return { startDate, endDate };
}

// Permission checking
export function hasPermission(member, requiredRoles) {
    if (!member || !requiredRoles || requiredRoles.length === 0) return false;
    return member.roles.cache.some(role => requiredRoles.includes(role.id));
}

export function isManagement(member, managementRoles) {
    return hasPermission(member, managementRoles);
}

// Backup utilities
export function createBackup() {
    const backupDir = join(__dirname, '../../data/backups');
    if (!existsSync(backupDir)) {
        mkdirSync(backupDir, { recursive: true });
    }
    
    const timestamp = Date.now();
    const dbPath = join(__dirname, '../../data/database.db');
    const backupPath = join(backupDir, `backup-${timestamp}.db`);
    
    try {
        copyFileSync(dbPath, backupPath);
        return { success: true, path: backupPath, timestamp };
    } catch (error) {
        console.error('Backup creation failed:', error);
        return { success: false, error: error.message };
    }
}

export function listBackups() {
    const backupDir = join(__dirname, '../../data/backups');
    if (!existsSync(backupDir)) {
        return [];
    }
    
    try {
        const files = readdirSync(backupDir);
        return files
            .filter(file => file.startsWith('backup-') && file.endsWith('.db'))
            .map(file => {
                const timestamp = parseInt(file.replace('backup-', '').replace('.db', ''));
                return {
                    filename: file,
                    timestamp,
                    date: formatDateTime(timestamp)
                };
            })
            .sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
        console.error('Failed to list backups:', error);
        return [];
    }
}

export function restoreBackup(filename) {
    const backupPath = join(__dirname, '../../data/backups', filename);
    const dbPath = join(__dirname, '../../data/database.db');
    
    if (!existsSync(backupPath)) {
        return { success: false, error: 'Backup file not found' };
    }
    
    try {
        // Create a backup of current database before restore
        const currentBackup = createBackup();
        if (!currentBackup.success) {
            return { success: false, error: 'Failed to backup current database' };
        }
        
        // Restore the backup
        copyFileSync(backupPath, dbPath);
        return { success: true };
    } catch (error) {
        console.error('Restore failed:', error);
        return { success: false, error: error.message };
    }
}

// Statistics helpers
export function calculatePercentageChange(current, previous) {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous * 100).toFixed(1);
}

export function getRating(count, threshold) {
    if (count >= threshold * 2) return '⭐⭐⭐⭐⭐';
    if (count >= threshold * 1.5) return '⭐⭐⭐⭐';
    if (count >= threshold) return '⭐⭐⭐';
    if (count >= threshold * 0.5) return '⭐⭐';
    return '⭐';
}

// Embed colors
export const EmbedColors = {
    SUCCESS: 0x00ff00,
    ERROR: 0xff0000,
    INFO: 0x3498db,
    WARNING: 0xffaa00,
    STATS: 0x9b59b6,
    ADMIN: 0xe74c3c
};
