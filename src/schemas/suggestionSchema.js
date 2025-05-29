const mongoose = require('mongoose');

const suggestionSchema = new mongoose.Schema({
  suggestionId: String,
  guildId: String,
  channelId: String,
  messageId: String,
  userId: String,
  suggestion: String,
  status: { type: String, default: "Pending" },
  upvotes: [String],
  downvotes: [String]
});

const suggestionChannelSchema = new mongoose.Schema({
  guildId: String,
  channelId: String
});

module.exports.Suggestion = mongoose.model('Suggestion', suggestionSchema);
module.exports.SuggestionChannel = mongoose.model('SuggestionChannel', suggestionChannelSchema);