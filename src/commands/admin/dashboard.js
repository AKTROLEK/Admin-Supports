import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { db } from '../../database/schema.js';
import { getDateRange, formatDuration, EmbedColors } from '../../utils/helpers.js';
import { t } from '../../locales/index.js';

export default {
    data: new SlashCommandBuilder()
        .setName('dashboard')
        .setNameLocalizations({ 'ar': 'لوحة-التحكم' })
        .setDescription('View admin dashboard')
        .setDescriptionLocalizations({ 'ar': 'عرض لوحة التحكم الإدارية' }),
    
    execute: async (interaction) => {
        await interaction.deferReply();
        
        const { startDate, endDate } = getDateRange('weekly');
        
        // Get top admins by voice time
        const topVoice = db.prepare(`
            SELECT user_id, username, SUM(duration) as total_duration
            FROM voice_sessions
            WHERE date BETWEEN ? AND ? AND duration IS NOT NULL
            GROUP BY user_id
            ORDER BY total_duration DESC
            LIMIT 5
        `).all(startDate, endDate);
        
        // Get top admins by interactions
        const topInteractions = db.prepare(`
            SELECT admin_id, admin_username, COUNT(*) as count
            FROM user_interactions
            WHERE date BETWEEN ? AND ?
            GROUP BY admin_id
            ORDER BY count DESC
            LIMIT 5
        `).all(startDate, endDate);
        
        // Get top admins by messages
        const topMessages = db.prepare(`
            SELECT user_id, username, SUM(message_count) as total_messages
            FROM message_activity
            WHERE date BETWEEN ? AND ?
            GROUP BY user_id
            ORDER BY total_messages DESC
            LIMIT 5
        `).all(startDate, endDate);
        
        // Get recent server actions
        const recentActions = db.prepare(`
            SELECT admin_username, action_type, target_name, timestamp
            FROM server_actions
            WHERE date BETWEEN ? AND ?
            ORDER BY timestamp DESC
            LIMIT 5
        `).all(startDate, endDate);
        
        // Get currently active voice users
        const activeVoice = db.prepare(`
            SELECT user_id, username, channel_name, join_time
            FROM voice_sessions
            WHERE leave_time IS NULL
            ORDER BY join_time DESC
        `).all();
        
        const embed = new EmbedBuilder()
            .setColor(EmbedColors.ADMIN)
            .setTitle('📊 ' + t('dashboard_title'))
            .setDescription(`**الفترة:** ${startDate} → ${endDate}`)
            .addFields(
                {
                    name: '🏆 أفضل الإداريين (وقت الصوت)',
                    value: topVoice.length > 0 
                        ? topVoice.map((admin, i) => `${i + 1}. ${admin.username} - ${formatDuration(admin.total_duration)}`).join('\n')
                        : 'لا توجد بيانات',
                    inline: false
                },
                {
                    name: '👥 أفضل الإداريين (التفاعلات)',
                    value: topInteractions.length > 0
                        ? topInteractions.map((admin, i) => `${i + 1}. ${admin.admin_username} - ${admin.count} تفاعل`).join('\n')
                        : 'لا توجد بيانات',
                    inline: false
                },
                {
                    name: '💬 أفضل الإداريين (الرسائل)',
                    value: topMessages.length > 0
                        ? topMessages.map((admin, i) => `${i + 1}. ${admin.username} - ${admin.total_messages} رسالة`).join('\n')
                        : 'لا توجد بيانات',
                    inline: false
                }
            );
        
        if (activeVoice.length > 0) {
            embed.addFields({
                name: '🎤 نشط الآن في الصوت',
                value: activeVoice.slice(0, 5).map(user => {
                    const duration = Date.now() - user.join_time;
                    return `${user.username} في ${user.channel_name} (${formatDuration(duration)})`;
                }).join('\n'),
                inline: false
            });
        }
        
        if (recentActions.length > 0) {
            embed.addFields({
                name: '⚡ النشاط الأخير',
                value: recentActions.map(action => {
                    const timeAgo = Math.floor((Date.now() - action.timestamp) / 60000);
                    return `${action.admin_username}: ${action.action_type} على ${action.target_name || 'N/A'} (منذ ${timeAgo} دقيقة)`;
                }).join('\n'),
                inline: false
            });
        }
        
        embed.setFooter({ text: t('footer_stats', { date: new Date().toLocaleDateString('ar-SA') }) })
            .setTimestamp();
        
        await interaction.editReply({ embeds: [embed] });
    }
};
