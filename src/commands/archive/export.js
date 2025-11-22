import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, AttachmentBuilder } from 'discord.js';
import { db } from '../../database/schema.js';
import { getDateRange, EmbedColors } from '../../utils/helpers.js';
import { t } from '../../locales/index.js';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
    data: new SlashCommandBuilder()
        .setName('export')
        .setNameLocalizations({ 'ar': 'تصدير' })
        .setDescription('Export statistics to JSON')
        .setDescriptionLocalizations({ 'ar': 'تصدير الإحصائيات بصيغة JSON' })
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option
                .setName('period')
                .setNameLocalizations({ 'ar': 'الفترة' })
                .setDescription('Time period')
                .setDescriptionLocalizations({ 'ar': 'الفترة الزمنية' })
                .addChoices(
                    { name: 'Daily / يومي', value: 'daily' },
                    { name: 'Weekly / أسبوعي', value: 'weekly' },
                    { name: 'Monthly / شهري', value: 'monthly' }
                )
                .setRequired(false)
        ),
    
    execute: async (interaction) => {
        await interaction.deferReply({ ephemeral: true });
        
        const period = interaction.options.getString('period') || 'weekly';
        const { startDate, endDate } = getDateRange(period);
        
        try {
            // Collect all data
            const data = {
                export_date: new Date().toISOString(),
                period: period,
                date_range: { start: startDate, end: endDate },
                voice_sessions: db.prepare(`
                    SELECT * FROM voice_sessions 
                    WHERE date BETWEEN ? AND ?
                `).all(startDate, endDate),
                user_interactions: db.prepare(`
                    SELECT * FROM user_interactions 
                    WHERE date BETWEEN ? AND ?
                `).all(startDate, endDate),
                role_changes: db.prepare(`
                    SELECT * FROM role_changes 
                    WHERE date BETWEEN ? AND ?
                `).all(startDate, endDate),
                channel_changes: db.prepare(`
                    SELECT * FROM channel_changes 
                    WHERE date BETWEEN ? AND ?
                `).all(startDate, endDate),
                server_actions: db.prepare(`
                    SELECT * FROM server_actions 
                    WHERE date BETWEEN ? AND ?
                `).all(startDate, endDate),
                message_activity: db.prepare(`
                    SELECT * FROM message_activity 
                    WHERE date BETWEEN ? AND ?
                `).all(startDate, endDate),
                admin_notes: db.prepare(`SELECT * FROM admin_notes`).all()
            };
            
            // Write to exports directory in project
            const exportsDir = join(__dirname, '../../../data/exports');
            if (!existsSync(exportsDir)) {
                mkdirSync(exportsDir, { recursive: true });
            }
            
            const filename = `statistics-export-${Date.now()}.json`;
            const filepath = join(exportsDir, filename);
            writeFileSync(filepath, JSON.stringify(data, null, 2));
            
            // Create attachment
            const attachment = new AttachmentBuilder(filepath, { name: filename });
            
            const embed = new EmbedBuilder()
                .setColor(EmbedColors.SUCCESS)
                .setTitle('✅ ' + t('archive_exported'))
                .setDescription('تم تصدير الإحصائيات بنجاح')
                .addFields(
                    { name: 'الفترة', value: period === 'daily' ? 'يومي' : period === 'weekly' ? 'أسبوعي' : 'شهري', inline: true },
                    { name: 'التواريخ', value: `${startDate} → ${endDate}`, inline: true },
                    { name: 'جلسات الصوت', value: `${data.voice_sessions.length}`, inline: true },
                    { name: 'التفاعلات', value: `${data.user_interactions.length}`, inline: true },
                    { name: 'تغييرات الرتب', value: `${data.role_changes.length}`, inline: true },
                    { name: 'إجراءات السيرفر', value: `${data.server_actions.length}`, inline: true }
                )
                .setTimestamp();
            
            await interaction.editReply({ embeds: [embed], files: [attachment] });
        } catch (error) {
            console.error('Export error:', error);
            await interaction.editReply({ content: '❌ حدث خطأ أثناء تصدير الإحصائيات' });
        }
    }
};
