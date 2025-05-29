// commands/ticket/ticket-addoption.js
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const TicketSetup = require('../../schemas/ticketSetupSystem');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-addoption')
    .setDescription('Tambahkan opsi jenis tiket ke panel.')
    .addStringOption(opt => opt.setName('label').setDescription('Nama tiket (misalnya: Bantuan)').setRequired(true))
    .addStringOption(opt => opt.setName('emoji').setDescription('Emoji (misalnya: 🛠️)').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const { guild, options } = interaction;

    const label = options.getString('label');
    const emoji = options.getString('emoji');

    const data = await TicketSetup.findOne({ GuildID: guild.id });
    if (!data) {
      return interaction.reply({ content: 'Silakan setup terlebih dahulu menggunakan `/ticket-setup`.', ephemeral: true });
    }

    if (data.Options.length >= 25) {
      return interaction.reply({ content: 'Kamu hanya dapat memiliki maksimal 25 opsi untuk select menu.', ephemeral: true });
    }

    data.Options.push({ label, emoji });
    await data.save();

    interaction.reply({ content: `Berhasil menambahkan opsi \`${label}\` dengan emoji ${emoji}.`, ephemeral: true });
  }
};