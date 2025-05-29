// commands/ticket/ticket-removeoption.js
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const TicketSetup = require('../../schemas/ticketSetupSystem');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-removeoption')
    .setDescription('Hapus opsi tiket dari panel ticket selectmenu.')
    .addStringOption(opt =>
      opt.setName('label')
        .setDescription('Label dari opsi tiket yang ingin dihapus')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const { guild, options } = interaction;
    const label = options.getString('label');

    const data = await TicketSetup.findOne({ GuildID: guild.id });
    if (!data) {
      return interaction.reply({ content: 'Sistem tiket belum di-setup.', ephemeral: true });
    }

    const index = data.Options.findIndex(opt => opt.label.toLowerCase() === label.toLowerCase());
    if (index === -1) {
      return interaction.reply({ content: `Opsi dengan label \`${label}\` tidak ditemukan.`, ephemeral: true });
    }

    data.Options.splice(index, 1);
    await data.save();

    interaction.reply({ content: `Opsi \`${label}\` berhasil dihapus dari panel tiket.`, ephemeral: true });
  }
};