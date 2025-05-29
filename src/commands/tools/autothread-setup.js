const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const autoThreadSchema = require('../../schemas/autoThreadSystem');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('autothread-setup')
    .setDescription('Aktifkan auto thread di channel tertentu')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel yang ingin diaktifkan auto-thread')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');
    const data = await autoThreadSchema.findOne({ GuildID: interaction.guild.id });

    if (data) {
      if (data.ChannelIDs.includes(channel.id)) {
        return interaction.reply({ content: `Channel ini sudah aktif auto-thread.`, ephemeral: true });
      }
      data.ChannelIDs.push(channel.id);
      await data.save();
    } else {
      await autoThreadSchema.create({
        GuildID: interaction.guild.id,
        ChannelIDs: [channel.id],
      });
    }

    interaction.reply({ content: `Channel ${channel} sekarang akan otomatis membuat thread dari setiap pesan.`, ephemeral: true });
  }
};