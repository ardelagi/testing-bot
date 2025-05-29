const {
    Events,
    ActionRowBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} = require('discord.js');
const SelectMenu = require('../../schemas/SelectMenuSchema');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (interaction.isStringSelectMenu() && interaction.customId === 'edit-product-select') {
            const [channelID, label] = interaction.values[0].split('|');
            const data = await SelectMenu.findOne({ GuildID: interaction.guildId });
            if (!data) return;

            const channelData = data.channels.find(ch => ch.channelID === channelID);
            if (!channelData) return;

            const product = channelData.options.find(opt => opt.label === label);
            if (!product) return interaction.reply({ content: "Product not found.", ephemeral: true });

            const modal = new ModalBuilder()
                .setCustomId(`edit-product-modal:${channelID}:${label}`)
                .setTitle(`Edit Product: ${label}`)
                .addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId("label")
                            .setLabel("Label")
                            .setStyle(TextInputStyle.Short)
                            .setValue(product.label)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId("description")
                            .setLabel("Description")
                            .setStyle(TextInputStyle.Short)
                            .setValue(product.description)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId("emoji")
                            .setLabel("Emoji")
                            .setStyle(TextInputStyle.Short)
                            .setValue(product.emoji || "")
                            .setRequired(false)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId("response")
                            .setLabel("Response")
                            .setStyle(TextInputStyle.Paragraph)
                            .setValue(product.response)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId("image")
                            .setLabel("Image URL")
                            .setStyle(TextInputStyle.Short)
                            .setValue(product.imageResponse || "")
                            .setRequired(false)
                    )
                );

            await interaction.showModal(modal);
        }

        if (interaction.isModalSubmit() && interaction.customId.startsWith("edit-product-modal:")) {
            const [, channelID, oldLabel] = interaction.customId.split(':');
            const newLabel = interaction.fields.getTextInputValue("label");
            const description = interaction.fields.getTextInputValue("description");
            const emoji = interaction.fields.getTextInputValue("emoji");
            const response = interaction.fields.getTextInputValue("response");
            const image = interaction.fields.getTextInputValue("image");

            const data = await SelectMenu.findOne({ GuildID: interaction.guildId });
            if (!data) return;

            const channelData = data.channels.find(ch => ch.channelID === channelID);
            if (!channelData) return;

            const index = channelData.options.findIndex(opt => opt.label === oldLabel);
            if (index === -1) return interaction.reply({ content: "Product not found.", ephemeral: true });

            // Update product
            channelData.options[index] = {
                label: newLabel,
                description,
                emoji,
                response,
                imageResponse: image || null
            };

            await data.save();
            return interaction.reply({ content: `Product **${oldLabel}** updated successfully.`, ephemeral: true });
        }
    }
};