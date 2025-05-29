const mongoose = require('mongoose');

const welcomeSchema = new mongoose.Schema({
  guildId: String,
  welcomeChannelId: String,
  goodbyeChannelId: String
});

module.exports = mongoose.model('WelcomeSystem', welcomeSchema);