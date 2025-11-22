import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { voiceSessions, userInteractions, roleChanges, serverActions, messageActivity } from '../../database/queries.js';
import { getDateRange, formatDuration, EmbedColors } from '../../utils/helpers.js';
import { t } from '../../locales/index.js';

export default {
    data: new SlashCommandBuilder()
        .setName('stats-monthly')
        .setNameLocalizations({ 'ar': 'احصائيات-شهرية' })
        .setDescription('View monthly statistics')
        .setDescriptionLocalizations({ 'ar': 'عرض الإحصائيات الشهرية' })
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
        const { startDate, endDate } = getDateRange('monthly');
        
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
        
        // Calculate averages
        const avgVoicePerDay = voiceData.total_duration / 30;
        const avgInteractionsPerDay = interactions.count / 30;
        const avgMessagesPerDay = messagesData.total_messages / 30;
        
        // Calculate longest session
        let longestSession = 0;
        voiceSessions_list.forEach(session => {
            if (session.duration && session.duration > longestSession) {
                longestSession = session.duration;
            }
        });
        
        const embed = new EmbedBuilder()
            .setColor(EmbedColors.STATS)
            .setTitle(`📊 ${t('stats_title', { period: t('stats_monthly') })}`)
            .setDescription(`**المستخدم:** ${targetUser}\n**الفترة:** ${startDate} → ${endDate}`)
            .addFields(
                {
                    name: '🎤 إحصائيات الصوت',
                    value: `**⏱️ إجمالي الوقت:** ${formatDuration(voiceData.total_duration)}\n**📅 المعدل اليومي:** ${formatDuration(avgVoicePerDay)}\n**🔢 عدد الجلسات:** ${voiceSessions_list.length}\n**🏆 أطول جلسة:** ${formatDuration(longestSession)}`,
                    inline: false
                },
                {
                    name: '💬 نشاط الرسائل',
                    value: `**إجمالي:** ${messagesData.total_messages} رسالة\n**يومياً:** ${Math.round(avgMessagesPerDay)} رسالة`,
                    inline: true
                },
                {
                    name: '👥 التفاعلات',
                    value: `**إجمالي:** ${interactions.count} تفاعل\n**يومياً:** ${Math.round(avgInteractionsPerDay)} تفاعل`,
                    inline: true
                },
                {
                    name: '🎭 تغييرات الرتب',
                    value: `${roleChangesCount.count} تغيير`,
                    inline: true
                },
                {
                    name: '⚡ إجراءات السيرفر',
                    value: `${actions.length} إجراء`,
                    inline: true
                },
                {
                    name: '📈 تقييم الأداء الشهري',
                    value: getMonthlyRating(voiceData.total_duration, interactions.count, messagesData.total_messages, roleChangesCount.count),
                    inline: false
                },
                {
                    name: '🏅 ملخص الأداء',
                    value: getPerformanceSummary(voiceData.total_duration, interactions.count, messagesData.total_messages),
                    inline: false
                }
            )
            .setFooter({ text: t('footer_stats', { date: new Date().toLocaleDateString('ar-SA') }) })
            .setTimestamp();
        
        await interaction.editReply({ embeds: [embed] });
    }
};

function getMonthlyRating(voiceTime, interactions, messages, roleChanges) {
    const score = (voiceTime / 60000) + (interactions * 10) + (messages * 2) + (roleChanges * 15);
    
    if (score >= 15000) return '⭐⭐⭐⭐⭐ إداري متميز - أداء استثنائي';
    if (score >= 10000) return '⭐⭐⭐⭐ إداري نشط - أداء ممتاز';
    if (score >= 5000) return '⭐⭐⭐ إداري فعال - أداء جيد';
    if (score >= 2000) return '⭐⭐ إداري مبتدئ - أداء مقبول';
    return '⭐ نشاط محدود - يحتاج تحسين';
}

function getPerformanceSummary(voiceTime, interactions, messages) {
    const voiceHours = Math.floor(voiceTime / 3600000);
    
    let summary = '';
    if (voiceHours >= 100) summary += '✅ وقت صوت ممتاز\n';
    else if (voiceHours >= 50) summary += '👍 وقت صوت جيد\n';
    else summary += '⚠️ وقت صوت يحتاج زيادة\n';
    
    if (interactions >= 100) summary += '✅ تفاعل نشط مع الأعضاء\n';
    else if (interactions >= 50) summary += '👍 تفاعل جيد\n';
    else summary += '⚠️ تفاعل محدود\n';
    
    if (messages >= 500) summary += '✅ نشاط كتابي ممتاز';
    else if (messages >= 200) summary += '👍 نشاط كتابي جيد';
    else summary += '⚠️ نشاط كتابي محدود';
    
    return summary;
}
