const { SlashCommandBuilder, ChannelType } = require('discord.js');
const ytNotifSchema = require('../../schemas/ytnotif');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-ytnotif')
    .setDescription('Setup notifikasi upload YouTube')
    .addStringOption(opt =>
      opt.setName('channel_id')
        .setDescription('Masukkan YouTube Channel ID (bukan URL)')
        .setRequired(true))
    .addChannelOption(opt =>
      opt.setName('target_channel')
        .setDescription('Channel untuk mengirim notifikasi')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)),
  async execute(interaction) {
    const ytChannelId = interaction.options.getString('channel_id');
    const targetChannel = interaction.options.getChannel('target_channel');

    await ytNotifSchema.findOneAndUpdate(
      { guildId: interaction.guild.id },
      {
        guildId: interaction.guild.id,
        channelId: targetChannel.id,
        youtubeChannelId: ytChannelId
      },
      { upsert: true }
    );

    await interaction.reply({ content: 'Notifikasi YouTube berhasil disetup!', ephemeral: true });
  }
};