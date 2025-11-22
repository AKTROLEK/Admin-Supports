import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { voiceSessions, userInteractions, roleChanges, serverActions, messageActivity } from '../../database/queries.js';
import { getDateRange, formatDuration, EmbedColors } from '../../utils/helpers.js';
import { t } from '../../locales/index.js';

export default {
    data: new SlashCommandBuilder()
        .setName('stats-weekly')
        .setNameLocalizations({ 'ar': 'احصائيات-اسبوعية' })
        .setDescription('View weekly statistics')
        .setDescriptionLocalizations({ 'ar': 'عرض الإحصائيات الأسبوعية' })
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
        const { startDate, endDate } = getDateRange('weekly');
        
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
        
        // Calculate average per day
        const avgVoicePerDay = voiceData.total_duration / 7;
        const avgInteractionsPerDay = interactions.count / 7;
        const avgMessagesPerDay = messagesData.total_messages / 7;
        
        const embed = new EmbedBuilder()
            .setColor(EmbedColors.STATS)
            .setTitle(`📊 ${t('stats_title', { period: t('stats_weekly') })}`)
            .setDescription(`**المستخدم:** ${targetUser}\n**الفترة:** ${startDate} → ${endDate}`)
            .addFields(
                {
                    name: '🎤 ' + t('voice_time'),
                    value: `**الإجمالي:** ${formatDuration(voiceData.total_duration)}\n**المعدل اليومي:** ${formatDuration(avgVoicePerDay)}\n**الجلسات:** ${voiceSessions_list.length}`,
                    inline: false
                },
                {
                    name: '💬 ' + t('messages_sent'),
                    value: `**الإجمالي:** ${messagesData.total_messages}\n**المعدل اليومي:** ${Math.round(avgMessagesPerDay)}`,
                    inline: true
                },
                {
                    name: '👥 ' + t('total_interactions'),
                    value: `**الإجمالي:** ${interactions.count}\n**المعدل اليومي:** ${Math.round(avgInteractionsPerDay)}`,
                    inline: true
                },
                {
                    name: '📊 نشاط إداري',
                    value: `**🎭 تغييرات الرتب:** ${roleChangesCount.count}\n**⚡ إجراءات السيرفر:** ${actions.length}`,
                    inline: false
                },
                {
                    name: '⭐ التقييم الأسبوعي',
                    value: getWeeklyRating(voiceData.total_duration, interactions.count, messagesData.total_messages),
                    inline: false
                }
            )
            .setFooter({ text: t('footer_stats', { date: new Date().toLocaleDateString('ar-SA') }) })
            .setTimestamp();
        
        await interaction.editReply({ embeds: [embed] });
    }
};

function getWeeklyRating(voiceTime, interactions, messages) {
    const score = (voiceTime / 60000) + (interactions * 10) + (messages * 2);
    
    if (score >= 3000) return '⭐⭐⭐⭐⭐ أداء استثنائي';
    if (score >= 2000) return '⭐⭐⭐⭐ أداء ممتاز';
    if (score >= 1000) return '⭐⭐⭐ أداء جيد';
    if (score >= 500) return '⭐⭐ أداء مقبول';
    return '⭐ يحتاج تحسين';
}
