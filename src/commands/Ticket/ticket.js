// commands/ticket/ticket-panel.js
const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
  ChannelType,
  PermissionFlagsBits
} = require('discord.js');
const TicketSetup = require('../../schemas/ticketSetupSystem');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-panel')
    .setDescription('Kirimkan panel tiket ke channel yang telah disetup.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const data = await TicketSetup.findOne({ GuildID: interaction.guild.id });
    if (!data) {
      return interaction.reply({ content: 'Sistem tiket belum di-setup. Gunakan `/ticket-setup`.', ephemeral: true });
    }

    if (data.Options.length === 0) {
      return interaction.reply({ content: 'Belum ada opsi tiket. Tambahkan dulu menggunakan `/ticket-addoption`.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle(data.Title)
      .setDescription(data.Description)
      .setColor(data.Color);

    const menu = new StringSelectMenuBuilder()
      .setCustomId('ticket-select')
      .setPlaceholder('Pilih jenis tiket...')
      .addOptions(
        data.Options.map(opt => ({
          label: opt.label,
          description: `Buka tiket untuk ${opt.label}`,
          value: opt.label.toLowerCase().replace(/\s+/g, '_'),
          emoji: opt.emoji
        }))
      );

    const row = new ActionRowBuilder().addComponents(menu);
    const channel = interaction.guild.channels.cache.get(data.Channel);

    await channel.send({ embeds: [embed], components: [row] });
    interaction.reply({ content: 'Panel tiket berhasil dikirim.', ephemeral: true });
  }
};