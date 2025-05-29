const { EmbedBuilder, Events } = require('discord.js');
const boomboxSchema = require('../../schemas/boomboxSystem'); // Ganti sesuai nama schema kamu

module.exports = {
  name: Events.MessageCreate,
  async execute(message, client) {
    if (message.author.bot || !message.guild) return;

    // Cek database Boombox System
    const boomboxData = await boomboxSchema.findOne({ Guild: message.guild.id });
    if (!boomboxData) return;

    if (message.channel.id !== boomboxData.Channel) return;

    // Cek kalau message bukan URL
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = message.content.match(urlRegex);

    if (!urls) return;

    const firstUrl = urls[0];

    // Validasi dan ekstrak ID video YouTube
    const match = firstUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/);
    if (!match) {
      const wrongLinkEmbed = new EmbedBuilder()
        .setColor('Red')
        .setAuthor({ name: `${client.user.username} boombox system` })
        .setTitle('Invalid URL')
        .setDescription('> Please send a valid **YouTube URL** to use the boombox system.')
        .setTimestamp()
        .setFooter({ text: 'Invalid URL Provided' });

      await message.channel.send({ embeds: [wrongLinkEmbed] });
      return;
    }

    const videoId = match[1];

    // List link mirror MP3 dan Video YouTube
    const mirrors = [
      `[Top4Top MP3](http://l.top4top.io/m_${videoId}.mp3)`,
      `[Y2Mate Tools](https://y2mate.tools/download/${videoId})`,
      `[YT1s](https://yt1s.com/en?q=https://youtu.be/${videoId})`,
      `[Loader.to](https://loader.to/en16/youtube-mp3/${videoId})`,
      `[YouTube Video](https://youtu.be/${videoId})` // Link video YouTube untuk dilihat
    ];

    // Embed dengan link MP3 dan YouTube Video
    const successEmbed = new EmbedBuilder()
      .setColor('Green')
      .setAuthor({ name: `${client.user.username} boombox system` })
      .setTitle('Boombox URL Received!')
      .setDescription(`> Successfully received the URL:\n> ${firstUrl}\n\nHere are some MP3 mirror links and YouTube Video for the video: https://youtu.be/${videoId}\n\n${mirrors.join('\n')}`)
      .setTimestamp();

    await message.channel.send({ embeds: [successEmbed] });

    try {
      // Reaction emoji kalau perlu
      await message.react(client.config.boomboxSuccessEmoji || '✅');

      // Opsional: simpan url di database jika perlu
      // boomboxData.LastUrl = firstUrl;
      // await boomboxData.save();

    } catch (error) {
      console.error(`[BOOMBOX_ERROR]`, error);

      const errorEmbed = new EmbedBuilder()
        .setColor('Red')
        .setDescription(`There was an error processing your request.\n\`\`\`${error.message}\`\`\``)
        .setTimestamp();

      await message.channel.send({ embeds: [errorEmbed] });
    }
  },
};