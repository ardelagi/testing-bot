const { Events, ChannelType, EmbedBuilder } = require('discord.js');
const autoThreadSchema = require('../../schemas/autoThreadSystem');

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (!message.guild || message.author.bot) return;
    if (message.channel.type !== ChannelType.GuildText) return;

    const config = await autoThreadSchema.findOne({ GuildID: message.guild.id });
    if (!config || !config.ChannelIDs.includes(message.channel.id)) return;

    const threadName = `${message.author.username} - ${message.content.slice(0, 30) || 'Diskusi'}`;

    try {
      const thread = await message.startThread({
        name: threadName,
        autoArchiveDuration: 60,
        reason: 'Auto thread system aktif',
      });

      // Embed peraturan thread
      const rulesEmbed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Peraturan Thread Diskusi')
        .setDescription(
          `Selamat datang di thread diskusi!\n\n` +
          `**Peraturan:**\n` +
          `• Hormati semua anggota.\n` +
          `• Tidak melakukan spam atau flood.\n` +
          `• Jangan membahas hal yang tidak relevan dengan topik.\n` +
          `• Gunakan bahasa yang sopan.\n` +
          `• Thread akan otomatis diarsipkan setelah 1 jam tidak aktif.\n\n` +
          `Harap patuhi peraturan agar diskusi tetap kondusif.`
        )
        .setFooter({ text: `Thread dibuat oleh ${message.author.tag}` })
        .setTimestamp();

      await thread.send({ embeds: [rulesEmbed] });

    } catch (err) {
      console.error(`Gagal membuat thread atau mengirim embed:`, err.message);
    }
  }
};