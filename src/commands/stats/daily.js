import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { voiceSessions, userInteractions, roleChanges, serverActions, messageActivity } from '../../database/queries.js';
import { getDateRange, formatDuration, EmbedColors } from '../../utils/helpers.js';
import { t } from '../../locales/index.js';

export default {
    data: new SlashCommandBuilder()
        .setName('stats-daily')
        .setNameLocalizations({ 'ar': 'احصائيات-يومية' })
        .setDescription('View daily statistics')
        .setDescriptionLocalizations({ 'ar': 'عرض الإحصائيات اليومية' })
        .addUserOption(option =>
            option
                .setName('user')
                .setNameLocalizations({ 'ar': 'مستخدم' })
                .setDescription('User to view statistics for')
                .setDescriptionLocalizations({ 'ar': 'المستخدم لعرض إحصائياته' })
                .setRequired(false)
        ),
    
    execute: async (interaction) => {
        await interaction.deferReply();
        
        const targetUser = interaction.options.getUser('user') || interaction.user;
        const { startDate, endDate } = getDateRange('daily');
        
        // Get voice sessions
        const voiceData = voiceSessions.getTotalDuration(targetUser.id, startDate, endDate);
        const voiceSessions_list = voiceSessions.getByDateRange(targetUser.id, startDate, endDate);
        
        // Get interactions
        const interactions = userInteractions.countByAdmin(targetUser.id, startDate, endDate);
        
        // Get role changes
        const roleChangesCount = roleChanges.countByAdmin(targetUser.id, startDate, endDate);
        
        // Get messages
        const messagesData = messageActivity.getTotalMessages(targetUser.id, startDate, endDate);
        
        // Get server actions
        const actions = serverActions.getByAdmin(targetUser.id, startDate, endDate);
        
        const embed = new EmbedBuilder()
            .setColor(EmbedColors.STATS)
            .setTitle(`📊 ${t('stats_title', { period: t('stats_daily') })}`)
            .setDescription(`**المستخدم:** ${targetUser}\n**التاريخ:** ${startDate}`)
            .addFields(
                {
                    name: '🎤 ' + t('voice_time'),
                    value: `${formatDuration(voiceData.total_duration)}\n${t('total_sessions')}: ${voiceSessions_list.length}`,
                    inline: true
                },
                {
                    name: '💬 ' + t('messages_sent'),
                    value: `${messagesData.total_messages} رسالة`,
                    inline: true
                },
                {
                    name: '👥 ' + t('total_interactions'),
                    value: `${interactions.count} تفاعل`,
                    inline: true
                },
                {
                    name: '🎭 ' + t('role_changes'),
                    value: `${roleChangesCount.count} تغيير`,
                    inline: true
                },
                {
                    name: '⚡ ' + t('server_actions'),
                    value: `${actions.length} إجراء`,
                    inline: true
                },
                {
                    name: '📈 التقييم',
                    value: getActivityRating(voiceData.total_duration, interactions.count, messagesData.total_messages),
                    inline: true
                }
            )
            .setFooter({ text: t('footer_stats', { date: new Date().toLocaleDateString('ar-SA') }) })
            .setTimestamp();
        
        await interaction.editReply({ embeds: [embed] });
    }
};

function getActivityRating(voiceTime, interactions, messages) {
    const score = (voiceTime / 60000) + (interactions * 10) + (messages * 2);
    
    if (score >= 500) return '⭐⭐⭐⭐⭐ ممتاز';
    if (score >= 300) return '⭐⭐⭐⭐ جيد جداً';
    if (score >= 150) return '⭐⭐⭐ جيد';
    if (score >= 50) return '⭐⭐ مقبول';
    return '⭐ ضعيف';
}
