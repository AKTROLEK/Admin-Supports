import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { setLocale, getCurrentLocale } from '../../locales/index.js';
import { EmbedColors } from '../../utils/helpers.js';

export default {
    data: new SlashCommandBuilder()
        .setName('language')
        // Arabic ('ar') locale is officially supported by Discord API
        // even though it's not yet in discord-api-types Locale enum
        .setNameLocalizations({ 'ar': 'اللغة' })
        .setDescription('Change bot language')
        .setDescriptionLocalizations({ 'ar': 'تغيير لغة البوت' })
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option
                .setName('lang')
                .setNameLocalizations({ 'ar': 'اللغة' })
                .setDescription('Language to set')
                .setDescriptionLocalizations({ 'ar': 'اللغة المراد تعيينها' })
                .addChoices(
                    { name: 'العربية', value: 'ar' },
                    { name: 'English', value: 'en' }
                )
                .setRequired(true)
        ),
    
    execute: async (interaction) => {
        const lang = interaction.options.getString('lang');
        const currentLang = getCurrentLocale();
        
        if (lang === currentLang) {
            await interaction.reply({
                content: lang === 'ar' 
                    ? '✅ اللغة الحالية هي العربية بالفعل'
                    : '✅ Current language is already English',
                ephemeral: true
            });
            return;
        }
        
        setLocale(lang);
        
        const embed = new EmbedBuilder()
            .setColor(EmbedColors.SUCCESS)
            .setTitle(lang === 'ar' ? '✅ تم تغيير اللغة' : '✅ Language Changed')
            .setDescription(
                lang === 'ar' 
                    ? 'تم تغيير لغة البوت إلى العربية بنجاح'
                    : 'Bot language has been changed to English successfully'
            )
            .setTimestamp();
        
        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
