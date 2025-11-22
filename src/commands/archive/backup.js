import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, AttachmentBuilder } from 'discord.js';
import { createBackup, listBackups, restoreBackup, EmbedColors } from '../../utils/helpers.js';
import { t } from '../../locales/index.js';

export default {
    data: new SlashCommandBuilder()
        .setName('backup')
        .setDescription('Manage database backups')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Create a new backup')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List all backups')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('restore')
                .setDescription('Restore from a backup')
                .addStringOption(option =>
                    option
                        .setName('filename')
                        .setDescription('Backup filename')
                        .setRequired(true)
                )
        ),
    
    execute: async (interaction) => {
        const subcommand = interaction.options.getSubcommand();
        
        if (subcommand === 'create') {
            await handleCreateBackup(interaction);
        } else if (subcommand === 'list') {
            await handleListBackups(interaction);
        } else if (subcommand === 'restore') {
            await handleRestoreBackup(interaction);
        }
    }
};

async function handleCreateBackup(interaction) {
    await interaction.deferReply({ ephemeral: true });
    
    try {
        const result = createBackup();
        
        if (result.success) {
            const embed = new EmbedBuilder()
                .setColor(EmbedColors.SUCCESS)
                .setTitle('✅ ' + t('backup_created'))
                .setDescription('تم إنشاء نسخة احتياطية بنجاح')
                .addFields(
                    { name: 'الوقت', value: new Date(result.timestamp).toLocaleString('ar-SA') },
                    { name: 'اسم الملف', value: `backup-${result.timestamp}.db` }
                )
                .setTimestamp();
            
            await interaction.editReply({ embeds: [embed] });
        } else {
            await interaction.editReply({ content: `❌ ${t('backup_failed')}: ${result.error}` });
        }
    } catch (error) {
        console.error('Backup creation error:', error);
        await interaction.editReply({ content: '❌ حدث خطأ أثناء إنشاء النسخة الاحتياطية' });
    }
}

async function handleListBackups(interaction) {
    await interaction.deferReply({ ephemeral: true });
    
    try {
        const backups = listBackups();
        
        if (backups.length === 0) {
            await interaction.editReply({ content: 'لا توجد نسخ احتياطية' });
            return;
        }
        
        const embed = new EmbedBuilder()
            .setColor(EmbedColors.INFO)
            .setTitle('📦 ' + t('backup_list'))
            .setDescription(`إجمالي النسخ الاحتياطية: ${backups.length}`);
        
        backups.slice(0, 20).forEach((backup, index) => {
            embed.addFields({
                name: `${index + 1}. ${backup.filename}`,
                value: `**التاريخ:** ${backup.date}`,
                inline: false
            });
        });
        
        if (backups.length > 20) {
            embed.setFooter({ text: `عرض 20 من ${backups.length} نسخة احتياطية` });
        }
        
        await interaction.editReply({ embeds: [embed] });
    } catch (error) {
        console.error('List backups error:', error);
        await interaction.editReply({ content: '❌ حدث خطأ أثناء عرض النسخ الاحتياطية' });
    }
}

async function handleRestoreBackup(interaction) {
    await interaction.deferReply({ ephemeral: true });
    
    const filename = interaction.options.getString('filename');
    
    try {
        const result = restoreBackup(filename);
        
        if (result.success) {
            const embed = new EmbedBuilder()
                .setColor(EmbedColors.SUCCESS)
                .setTitle('✅ ' + t('backup_restored'))
                .setDescription(`تم استرجاع النسخة الاحتياطية بنجاح من ${filename}`)
                .addFields({
                    name: '⚠️ ملاحظة مهمة',
                    value: 'تم إنشاء نسخة احتياطية من قاعدة البيانات الحالية قبل الاسترجاع'
                })
                .setTimestamp();
            
            await interaction.editReply({ embeds: [embed] });
        } else {
            await interaction.editReply({ content: `❌ فشل الاسترجاع: ${result.error}` });
        }
    } catch (error) {
        console.error('Restore backup error:', error);
        await interaction.editReply({ content: '❌ حدث خطأ أثناء استرجاع النسخة الاحتياطية' });
    }
}
