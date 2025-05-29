const {
    SlashCommandBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    PermissionFlagsBits
} = require("discord.js");
const SelectMenu = require("../../schemas/SelectMenuSchema");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("edit-product")
        .setDescription("Edit a product from a select menu.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    enabled: false,
    
    async execute(interaction) {
        const data = await SelectMenu.findOne({ GuildID: interaction.guildId });
        if (!data || !data.channels.length)
            return interaction.reply({ content: "No product data found.", ephemeral: true });

        const channelOptions = [];

        for (const ch of data.channels) {
            for (const opt of ch.options) {
                channelOptions.push({
                    label: `${opt.label}`,
                    value: `${ch.channelID}|${opt.label}`,
                    description: `From channel: #${interaction.guild.channels.cache.get(ch.channelID)?.name || "unknown"}`,
                    emoji: opt.emoji || undefined
                });
            }
        }

        if (!channelOptions.length)
            return interaction.reply({ content: "No options found in any channel.", ephemeral: true });

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId("edit-product-select")
            .setPlaceholder("Select a product to edit")
            .addOptions(channelOptions)
            .setMaxValues(1);

        const row = new ActionRowBuilder().addComponents(selectMenu);
        await interaction.reply({ content: "Select a product to edit:", components: [row], ephemeral: true });
    },
};