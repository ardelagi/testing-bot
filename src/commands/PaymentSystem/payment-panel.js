const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionFlagsBits
} = require('discord.js');
const PaymentSetup = require('../../schemas/paymentSetup');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('payment-panel')
    .setDescription('Tampilkan panel metode pembayaran.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel untuk mengirim panel.')
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText))
    .addStringOption(option =>
      option.setName('title')
        .setDescription('Judul embed.')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('description')
        .setDescription('Deskripsi embed.')
        .setRequired(true)),

  enabled: false,

  async execute(interaction) {
    const { guild, options } = interaction;
    const channel = options.getChannel('channel');
    const title = options.getString('title');
    const description = options.getString('description');

    const setup = await PaymentSetup.findOne({ GuildID: guild.id });

    if (!setup || setup.Payments.length === 0) {
      return interaction.reply({
        content: "Tidak ada metode pembayaran ditemukan. Gunakan `/set-payment` terlebih dahulu.",
        ephemeral: true
      });
    }

    // Buat embed panel
    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .setColor('Green')
      .setFooter({ text: `Total metode: ${setup.Payments.length}` });

    // Kelola tombol dalam beberapa row (maksimal 5 per baris)
    const rows = [];
    let currentRow = new ActionRowBuilder();

    for (const [i, method] of setup.Payments.entries()) {
      if (currentRow.components.length === 5) {
        rows.push(currentRow);
        currentRow = new ActionRowBuilder();
      }

      currentRow.addComponents(
        new ButtonBuilder()
          .setCustomId(`pay-${method.Method.toLowerCase()}`)
          .setLabel(method.Method)
          .setEmoji(method.Emoji || '💳')
          .setStyle(ButtonStyle.Primary)
      );
    }

    if (currentRow.components.length > 0) rows.push(currentRow);

    await channel.send({ embeds: [embed], components: rows });

    setup.ChannelID = channel.id;
    setup.Title = title;
    setup.Description = description;
    await setup.save();

    return interaction.reply({
      content: `Panel pembayaran berhasil dikirim ke ${channel}.`,
      ephemeral: true
    });
  },
};