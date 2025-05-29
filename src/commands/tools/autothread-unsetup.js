const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const autoThreadSchema = require('../../schemas/autoThreadSystem');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('autothread-unsetup')
    .setDescription('Matikan sistem auto thread di server ini.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const guildId = interaction.guild.id;

    const data = await autoThreadSchema.findOne({ GuildID: guildId });
    if (!data) {
      return interaction.reply({ content: 'Sistem auto thread belum diatur di server ini.', ephemeral: true });
    }

    await autoThreadSchema.deleteOne({ GuildID: guildId });

    interaction.reply({ content: 'Sistem auto thread berhasil dimatikan dan pengaturan dihapus.', ephemeral: true });
  },
};