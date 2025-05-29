const { SlashCommandBuilder, ChannelType, PermissionsBitField, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reminder')
        .setDescription('Set a periodic reminder in a specified channel')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The reminder message')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to send the reminder')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)),

    enabled: false,

    async execute(interaction) {
        // Check if the user has Administrator permission
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({
                content: '❌ You do not have permission to use this command. Only Administrators can use it.',
                ephemeral: true,
            });
        }

        const { options, guild } = interaction;
        const reminderMessage = options.getString('message');
        const channel = options.getChannel('channel');

        try {
            // Define available time options
            const timeOptions = [
                { label: "1 Minute", value: "60" },
                { label: "2 Minutes", value: "120" },
                { label: "3 Minutes", value: "180" },
                { label: "5 Minutes", value: "300" },
                { label: "10 Minutes", value: "600" },
                { label: "15 Minutes", value: "900" },
                { label: "20 Minutes", value: "1200" },
                { label: "30 Minutes", value: "1800" },
                { label: "45 Minutes", value: "2700" },
                { label: "1 Hour", value: "3600" },
                { label: "2 Hours", value: "7200" },
                { label: "3 Hours", value: "10800" },
                { label: "4 Hours", value: "14400" },
                { label: "5 Hours", value: "18000" },
                { label: "6 Hours", value: "21600" },
                { label: "12 Hours", value: "43200" },
                { label: "1 Day", value: "86400" },
            ];

            const selectMenu = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('reminder_time')
                    .setPlaceholder('Select a reminder interval')
                    .addOptions(timeOptions)
            );

            await interaction.reply({
                content: '⏰ Please select an interval for the periodic reminder:',
                components: [selectMenu],
                ephemeral: true,
            });

            const filter = (i) => i.user.id === interaction.user.id && i.customId === 'reminder_time';
            const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000, max: 1 });

            let lastMessage = null;

            collector.on('collect', async (menuInteraction) => {
                const selectedTime = parseInt(menuInteraction.values[0]);

                await menuInteraction.reply({
                    content: `✅ Periodic reminder set every ${selectedTime / 60} minutes in ${channel}.`,
                    ephemeral: true,
                });

                const interval = setInterval(async () => {
                    try {
                        if (lastMessage) await lastMessage.delete().catch(() => {});
                        lastMessage = await channel.send(reminderMessage);
                    } catch (error) {
                        clearInterval(interval);
                    }
                }, selectedTime * 1000);
            });

            collector.on('end', (collected) => {
                if (collected.size === 0) {
                    interaction.followUp({ content: '❌ No interval selected. Reminder cancelled.', ephemeral: true });
                }
            });

        } catch (error) {
            console.error('[Reminder Command] Error:', error);
            return interaction.reply({
                content: `❌ An error occurred while setting the reminder.`,
                ephemeral: true,
            });
        }
    },
};