import { roleChanges } from '../database/queries.js';
import { formatDate } from '../utils/helpers.js';

export default {
    name: 'guildMemberUpdate',
    execute: async (oldMember, newMember) => {
        const oldRoles = oldMember.roles.cache;
        const newRoles = newMember.roles.cache;
        
        // Check for added roles
        newRoles.forEach(role => {
            if (!oldRoles.has(role.id)) {
                // Find who added the role (this would need audit log access)
                const timestamp = Date.now();
                const date = formatDate(timestamp);
                
                // Store role addition
                console.log(`➕ Role added: ${role.name} to ${newMember.user.username}`);
                
                // Note: In a real implementation, you'd need to check audit logs
                // to find out who made the change
            }
        });
        
        // Check for removed roles
        oldRoles.forEach(role => {
            if (!newRoles.has(role.id)) {
                const timestamp = Date.now();
                const date = formatDate(timestamp);
                
                console.log(`➖ Role removed: ${role.name} from ${newMember.user.username}`);
            }
        });
    }
};
