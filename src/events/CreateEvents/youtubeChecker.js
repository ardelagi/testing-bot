const Parser = require('rss-parser');
const parser = new Parser();
const ytNotifSchema = require('../../schemas/ytnotif');

module.exports = {
  name: 'ready',
  async execute(client) {
    const checkYouTubeFeeds = async () => {
      const configs = await ytNotifSchema.find();

      for (const config of configs) {
        try {
          const feed = await parser.parseURL(`https://www.youtube.com/feeds/videos.xml?channel_id=${config.youtubeChannelId}`);
          const latest = feed.items?.[0];

          if (!latest || latest.id === config.lastVideoId) continue;

          const channel = await client.channels.fetch(config.channelId).catch(() => null);
          if (!channel || !channel.isTextBased()) continue;

          await channel.send({
            content: `@everyone\n\n**Video baru dari ${feed.title}!**\n**${latest.title}**\n${latest.link}`
          });

          config.lastVideoId = latest.id;
          await config.save();
        } catch (err) {
          console.error(`YT Notif Error (Channel ID: ${config.youtubeChannelId}):`, err.message);
        }
      }
    };

    // Jalankan saat bot online
    await checkYouTubeFeeds();

    // Jalankan setiap 5 menit
    setInterval(checkYouTubeFeeds, 1000 * 60 * 5);
  }
};