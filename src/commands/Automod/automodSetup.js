const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const AutoMod = require('../../schemas/automodSchema');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('automod-setup')
    .setDescription('Setup sistem auto moderator')
    .addChannelOption(opt =>
      opt.setName('logchannel')
         .setDescription('Channel untuk log pelanggaran')
         .addChannelTypes(ChannelType.GuildText)
         .setRequired(true))
    .addIntegerOption(opt =>
      opt.setName('warnlimit')
         .setDescription('Jumlah peringatan sebelum tindakan diambil')
         .setRequired(true))
    .addStringOption(opt =>
      opt.setName('action')
         .setDescription('Tindakan setelah mencapai limit')
         .addChoices(
           { name: 'timeout', value: 'timeout' },
           { name: 'kick', value: 'kick' },
           { name: 'ban', value: 'ban' }
         )
         .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const guildId = interaction.guild.id;
    const logChannel = interaction.options.getChannel('logchannel');
    const warnLimit = interaction.options.getInteger('warnlimit');
    const action = interaction.options.getString('action');

    await AutoMod.findOneAndUpdate(
      { GuildID: guildId },
      {
        GuildID: guildId,
        LogChannelID: logChannel.id,
        WarnLimit: warnLimit,
        Action: action,
        Enabled: true,
      },
      { upsert: true }
    );

    await interaction.reply({ content: 'AutoMod berhasil diaktifkan & dikonfigurasi.', ephemeral: true });
  }
};