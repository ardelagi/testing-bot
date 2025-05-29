const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  GuildID: String,
  ChannelIDs: [String], // channel yang diaktifkan auto-thread
});

module.exports = mongoose.model('autoThreadSystem', schema);