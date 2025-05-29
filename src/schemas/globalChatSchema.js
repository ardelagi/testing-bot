const mongoose = require('mongoose');

const globalChatSchema = new mongoose.Schema({
  guildId: String,
  channelId: String,
});

module.exports = mongoose.model('GlobalChat', globalChatSchema);