import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { setLocale, getCurrentLocale } from '../../locales/index.js';
import { EmbedColors } from '../../utils/helpers.js';

export default {
    data: new SlashCommandBuilder()
        .setName('language')
        // Note: Arabic localizations removed as 'ar' locale is not yet supported by Discord API
        // The bot still supports Arabic through its internal localization system
        .setDescription('Change bot language')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option
                .setName('lang')
                .setDescription('Language to set')
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
