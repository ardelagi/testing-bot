const mongoose = require('mongoose');

const adsSystemSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
    },
    messageId: {
        type: String,
        required: true,
    },
    channelId: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
    userTag: {
        type: String,
        required: true,
    },
    duration: {
        type: String,
        required: true,
    },
    endTimestamp: {
        type: Number,
        required: true,
    },
    roleId: {
        type: String,
        required: true,
    },
});

const adsSystem = mongoose.model('adsSystem', adsSystemSchema);

module.exports = adsSystem;