const { EmbedBuilder } = require('discord.js');
const GlobalChat = require('../../schemas/globalChatSchema');

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (
      message.author.bot ||
      !message.guild ||
      message.system ||
      message.webhookId
    ) return;

    const currentGuild = await GlobalChat.findOne({ guildId: message.guild.id });
    if (!currentGuild || currentGuild.channelId !== message.channel.id) return;

    const allGlobalChats = await GlobalChat.find({});

    for (const entry of allGlobalChats) {
      if (entry.guildId === message.guild.id) continue;

      const targetGuild = client.guilds.cache.get(entry.guildId);
      if (!targetGuild) continue;

      const targetChannel = targetGuild.channels.cache.get(entry.channelId);
      if (!targetChannel) continue;

      const embed = new EmbedBuilder()
        .setColor('Green')
        .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
        .setDescription(message.content || '*Pesan kosong*')
        .setFooter({ text: `Dari server: ${message.guild.name}` })
        .setTimestamp();

      targetChannel.send({ embeds: [embed] }).catch(() => {});
    }
  }
};