import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { voiceSessions, userInteractions, messageActivity } from '../../database/queries.js';
import { getDateRange, formatDuration, EmbedColors } from '../../utils/helpers.js';
import { t } from '../../locales/index.js';

export default {
    data: new SlashCommandBuilder()
        .setName('compare')
        .setDescription('Compare statistics between two admins')
        .addUserOption(option =>
            option
                .setName('user1')
                .setDescription('First user')
                .setRequired(true)
        )
        .addUserOption(option =>
            option
                .setName('user2')
                .setDescription('Second user')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('period')
                .setDescription('Time period')
                .addChoices(
                    { name: 'Daily / يومي', value: 'daily' },
                    { name: 'Weekly / أسبوعي', value: 'weekly' },
                    { name: 'Monthly / شهري', value: 'monthly' }
                )
                .setRequired(false)
        ),
    
    execute: async (interaction) => {
        await interaction.deferReply();
        
        const user1 = interaction.options.getUser('user1');
        const user2 = interaction.options.getUser('user2');
        const period = interaction.options.getString('period') || 'weekly';
        const { startDate, endDate } = getDateRange(period);
        
        // Get stats for user1
        const user1Voice = voiceSessions.getTotalDuration(user1.id, startDate, endDate);
        const user1Interactions = userInteractions.countByAdmin(user1.id, startDate, endDate);
        const user1Messages = messageActivity.getTotalMessages(user1.id, startDate, endDate);
        
        // Get stats for user2
        const user2Voice = voiceSessions.getTotalDuration(user2.id, startDate, endDate);
        const user2Interactions = userInteractions.countByAdmin(user2.id, startDate, endDate);
        const user2Messages = messageActivity.getTotalMessages(user2.id, startDate, endDate);
        
        // Calculate scores
        const user1Score = calculateScore(user1Voice.total_duration, user1Interactions.count, user1Messages.total_messages);
        const user2Score = calculateScore(user2Voice.total_duration, user2Interactions.count, user2Messages.total_messages);
        
        // Determine winner
        let winner = '';
        if (user1Score > user2Score) {
            const diff = user2Score > 0 ? ((user1Score - user2Score) / user2Score * 100).toFixed(1) : 'N/A';
            winner = `🏆 ${user1.username} متفوق بـ ${diff}${diff !== 'N/A' ? '%' : ''}`;
        } else if (user2Score > user1Score) {
            const diff = user1Score > 0 ? ((user2Score - user1Score) / user1Score * 100).toFixed(1) : 'N/A';
            winner = `🏆 ${user2.username} متفوق بـ ${diff}${diff !== 'N/A' ? '%' : ''}`;
        } else {
            winner = '🤝 أداء متساوٍ';
        }
        
        const embed = new EmbedBuilder()
            .setColor(EmbedColors.STATS)
            .setTitle(`⚔️ ${t('compare_title')}`)
            .setDescription(`**الفترة:** ${period === 'daily' ? 'يومي' : period === 'weekly' ? 'أسبوعي' : 'شهري'}\n**التواريخ:** ${startDate} → ${endDate}\n\n${winner}`)
            .addFields(
                {
                    name: `👤 ${user1.username}`,
                    value: `**🎤 وقت الصوت:** ${formatDuration(user1Voice.total_duration)}\n**👥 التفاعلات:** ${user1Interactions.count}\n**💬 الرسائل:** ${user1Messages.total_messages}\n**📊 النقاط:** ${user1Score}`,
                    inline: true
                },
                {
                    name: '🆚',
                    value: '\u200B',
                    inline: true
                },
                {
                    name: `👤 ${user2.username}`,
                    value: `**🎤 وقت الصوت:** ${formatDuration(user2Voice.total_duration)}\n**👥 التفاعلات:** ${user2Interactions.count}\n**💬 الرسائل:** ${user2Messages.total_messages}\n**📊 النقاط:** ${user2Score}`,
                    inline: true
                },
                {
                    name: '📊 تحليل مفصل',
                    value: getDetailedComparison(user1, user2, user1Voice, user2Voice, user1Interactions, user2Interactions, user1Messages, user2Messages),
                    inline: false
                }
            )
            .setFooter({ text: t('footer_stats', { date: new Date().toLocaleDateString('ar-SA') }) })
            .setTimestamp();
        
        await interaction.editReply({ embeds: [embed] });
    }
};

function calculateScore(voiceTime, interactions, messages) {
    return Math.floor((voiceTime / 60000) + (interactions * 10) + (messages * 2));
}

function getDetailedComparison(user1, user2, voice1, voice2, int1, int2, msg1, msg2) {
    let comparison = '';
    
    // Voice comparison
    if (voice1.total_duration > voice2.total_duration) {
        const diff = voice2.total_duration > 0 
            ? ((voice1.total_duration - voice2.total_duration) / voice2.total_duration * 100).toFixed(1) 
            : 'N/A';
        comparison += `🎤 ${user1.username} لديه وقت صوت أكثر بـ ${diff}${diff !== 'N/A' ? '%' : ''}\n`;
    } else if (voice2.total_duration > voice1.total_duration) {
        const diff = voice1.total_duration > 0 
            ? ((voice2.total_duration - voice1.total_duration) / voice1.total_duration * 100).toFixed(1) 
            : 'N/A';
        comparison += `🎤 ${user2.username} لديه وقت صوت أكثر بـ ${diff}${diff !== 'N/A' ? '%' : ''}\n`;
    } else {
        comparison += `🎤 وقت الصوت متساوٍ\n`;
    }
    
    // Interactions comparison
    if (int1.count > int2.count) {
        const diff = int2.count > 0 
            ? ((int1.count - int2.count) / int2.count * 100).toFixed(1) 
            : 'N/A';
        comparison += `👥 ${user1.username} لديه تفاعلات أكثر بـ ${diff}${diff !== 'N/A' ? '%' : ''}\n`;
    } else if (int2.count > int1.count) {
        const diff = int1.count > 0 
            ? ((int2.count - int1.count) / int1.count * 100).toFixed(1) 
            : 'N/A';
        comparison += `👥 ${user2.username} لديه تفاعلات أكثر بـ ${diff}${diff !== 'N/A' ? '%' : ''}\n`;
    } else {
        comparison += `👥 التفاعلات متساوية\n`;
    }
    
    // Messages comparison
    if (msg1.total_messages > msg2.total_messages) {
        const diff = msg2.total_messages > 0 
            ? ((msg1.total_messages - msg2.total_messages) / msg2.total_messages * 100).toFixed(1) 
            : 'N/A';
        comparison += `💬 ${user1.username} لديه رسائل أكثر بـ ${diff}${diff !== 'N/A' ? '%' : ''}`;
    } else if (msg2.total_messages > msg1.total_messages) {
        const diff = msg1.total_messages > 0 
            ? ((msg2.total_messages - msg1.total_messages) / msg1.total_messages * 100).toFixed(1) 
            : 'N/A';
        comparison += `💬 ${user2.username} لديه رسائل أكثر بـ ${diff}${diff !== 'N/A' ? '%' : ''}`;
    } else {
        comparison += `💬 الرسائل متساوية`;
    }
    
    return comparison;
}
