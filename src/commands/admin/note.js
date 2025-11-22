import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { adminNotes } from '../../database/queries.js';
import { formatDate, formatDateTime, EmbedColors } from '../../utils/helpers.js';
import { t } from '../../locales/index.js';

export default {
    data: new SlashCommandBuilder()
        .setName('note')
        .setDescription('Manage admin notes')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add a note to an admin')
                .addUserOption(option =>
                    option
                        .setName('admin')
                        .setDescription('The admin to add note for')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('note')
                        .setDescription('The note content')
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option
                        .setName('rating')
                        .setDescription('Rating (1-5)')
                        .setMinValue(1)
                        .setMaxValue(5)
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('View notes for an admin')
                .addUserOption(option =>
                    option
                        .setName('admin')
                        .setDescription('The admin to view notes for')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List all admin notes')
        ),
    
    execute: async (interaction) => {
        const subcommand = interaction.options.getSubcommand();
        
        if (subcommand === 'add') {
            await handleAddNote(interaction);
        } else if (subcommand === 'view') {
            await handleViewNotes(interaction);
        } else if (subcommand === 'list') {
            await handleListNotes(interaction);
        }
    }
};

async function handleAddNote(interaction) {
    await interaction.deferReply({ ephemeral: true });
    
    const admin = interaction.options.getUser('admin');
    const noteText = interaction.options.getString('note');
    const rating = interaction.options.getInteger('rating');
    
    const timestamp = Date.now();
    const date = formatDate(timestamp);
    
    try {
        adminNotes.create(
            admin.id,
            admin.username,
            interaction.user.id,
            interaction.user.username,
            noteText,
            rating,
            timestamp,
            date
        );
        
        const embed = new EmbedBuilder()
            .setColor(EmbedColors.SUCCESS)
            .setTitle('✅ تمت إضافة الملاحظة')
            .setDescription(`تمت إضافة ملاحظة لـ ${admin}`)
            .addFields(
                { name: 'الملاحظة', value: noteText },
                { name: 'التقييم', value: rating ? '⭐'.repeat(rating) : 'لا يوجد', inline: true },
                { name: 'بواسطة', value: interaction.user.username, inline: true }
            )
            .setTimestamp();
        
        await interaction.editReply({ embeds: [embed] });
    } catch (error) {
        console.error('Error adding note:', error);
        await interaction.editReply({ content: '❌ حدث خطأ أثناء إضافة الملاحظة' });
    }
}

async function handleViewNotes(interaction) {
    await interaction.deferReply();
    
    const admin = interaction.options.getUser('admin');
    const notes = adminNotes.getByAdmin(admin.id);
    
    if (notes.length === 0) {
        await interaction.editReply({ content: `لا توجد ملاحظات لـ ${admin}` });
        return;
    }
    
    const embed = new EmbedBuilder()
        .setColor(EmbedColors.INFO)
        .setTitle(`📝 ملاحظات ${admin.username}`)
        .setDescription(`إجمالي الملاحظات: ${notes.length}`);
    
    notes.slice(0, 10).forEach((note, index) => {
        const ratingText = note.rating ? '⭐'.repeat(note.rating) : 'لا يوجد';
        embed.addFields({
            name: `${index + 1}. ${formatDateTime(note.timestamp)}`,
            value: `**الملاحظة:** ${note.note}\n**التقييم:** ${ratingText}\n**بواسطة:** ${note.author_username}`,
            inline: false
        });
    });
    
    if (notes.length > 10) {
        embed.setFooter({ text: `عرض 10 من ${notes.length} ملاحظة` });
    }
    
    await interaction.editReply({ embeds: [embed] });
}

async function handleListNotes(interaction) {
    await interaction.deferReply();
    
    const allNotes = adminNotes.getAll();
    
    if (allNotes.length === 0) {
        await interaction.editReply({ content: 'لا توجد ملاحظات' });
        return;
    }
    
    // Group notes by admin
    const notesByAdmin = {};
    allNotes.forEach(note => {
        if (!notesByAdmin[note.admin_id]) {
            notesByAdmin[note.admin_id] = {
                username: note.admin_username,
                notes: []
            };
        }
        notesByAdmin[note.admin_id].notes.push(note);
    });
    
    const embed = new EmbedBuilder()
        .setColor(EmbedColors.INFO)
        .setTitle('📋 جميع ملاحظات الإداريين')
        .setDescription(`إجمالي الإداريين: ${Object.keys(notesByAdmin).length}`);
    
    Object.entries(notesByAdmin).slice(0, 10).forEach(([adminId, data]) => {
        const avgRating = data.notes.reduce((sum, note) => sum + (note.rating || 0), 0) / data.notes.length;
        embed.addFields({
            name: `${data.username}`,
            value: `**عدد الملاحظات:** ${data.notes.length}\n**متوسط التقييم:** ${'⭐'.repeat(Math.round(avgRating))}`,
            inline: true
        });
    });
    
    await interaction.editReply({ embeds: [embed] });
}
