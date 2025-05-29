const { SlashCommandBuilder, ChannelType } = require('discord.js');
const GlobalChat = require('../../schemas/globalChatSchema');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('set-globalchat')
    .setDescription('Mengatur channel Global Chat di server ini.')
    .addChannelOption(opt =>
      opt.setName('channel')
        .setDescription('Channel yang akan dijadikan Global Chat')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)),
  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');

    await GlobalChat.findOneAndUpdate(
      { guildId: interaction.guild.id },
      { guildId: interaction.guild.id, channelId: channel.id },
      { upsert: true }
    );

    await interaction.reply({ content: `Global Chat berhasil diatur di ${channel}`, ephemeral: true });
  }
};