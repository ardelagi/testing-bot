const { SlashCommandBuilder, PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const TicketSetup = require('../../schemas/ticketSetupSystem');
const TicketSchema = require('../../schemas/ticketSystem');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('close-ticket')
        .setDescription('Close the current ticket.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction) {
        const { guild, channel, member } = interaction;

        const setup = await TicketSetup.findOne({ GuildID: guild.id });
        if (!setup) {
            return interaction.reply({ content: 'Ticket system is not set up in this server.', ephemeral: true });
        }

        const ticketData = await TicketSchema.findOne({ GuildID: guild.id, ChannelID: channel.id });
        if (!ticketData) {
            return interaction.reply({ content: 'This channel is not a ticket.', ephemeral: true });
        }

        // Cek permission
        if (!member.permissions.has(PermissionFlagsBits.ManageChannels) && !member.roles.cache.has(setup.Handlers)) {
            return interaction.reply({ content: 'You do not have permission to close this ticket.', ephemeral: true });
        }

        const modal = new ModalBuilder()
            .setCustomId('close-ticket-modal')
            .setTitle('Close Ticket Reason');

        const reasonInput = new TextInputBuilder()
            .setCustomId('close-reason')
            .setLabel('Reason for closing this ticket')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Enter the reason here...')
            .setRequired(true);

        const actionRow = new ActionRowBuilder().addComponents(reasonInput);
        modal.addComponents(actionRow);

        return interaction.showModal(modal);
    }
};