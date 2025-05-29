const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const { SuggestionChannel } = require('../../schemas/suggestionSchema');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('set-suggestion-channel')
    .setDescription('Atur channel untuk saran')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel saran')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');

    await SuggestionChannel.findOneAndUpdate(
      { guildId: interaction.guild.id },
      { channelId: channel.id },
      { upsert: true, new: true }
    );

    interaction.reply({ content: `✅ Channel saran berhasil diatur ke ${channel}`, ephemeral: true });
  }
};