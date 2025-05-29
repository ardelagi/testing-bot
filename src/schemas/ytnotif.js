const mongoose = require('mongoose');

const ytNotifSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  channelId: { type: String, required: true },
  youtubeChannelId: { type: String, required: true },
  lastVideoId: { type: String, default: null }
});

module.exports = mongoose.model('ytnotif', ytNotifSchema);