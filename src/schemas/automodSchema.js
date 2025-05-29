const mongoose = require('mongoose');

const automodSchema = new mongoose.Schema({
  GuildID: { type: String, required: true, unique: true },
  Enabled: { type: Boolean, default: true },
  BadWords: { type: [String], default: ['anjing', 'goblok', 'babi', 'tolol', 'goblog', 'ANJING', 'GOBLOK', 'BABI', 'TOLOL', 'GOBLOG', 'memek', 'kontol', 'puki', 'cukimai', 'cukimay', 'MEMEK', 'KONTOL', 'PUKI', 'CUKIMAI', 'CUKIMAI', 'server', 'donet', 'donate', 'admin', 'atmin', 'SERVER', 'DONET', 'DONATE', 'ADMIN', 'ATMIN',] },
  WarnLimit: { type: Number, default: 3 },
  Action: { type: String, default: 'timeout' }, // options: warn, kick, ban, timeout
  LogChannelID: { type: String, required: false },
});

module.exports = mongoose.model('AutoMod', automodSchema);