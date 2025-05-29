const mongoose = require('mongoose');

const boomboxSchema = new mongoose.Schema({
    Guild: { type: String, required: true },
    Channel: { type: String, required: true },
    // Menyimpan URL terakhir yang dikirimkan (opsional)
    LastUrl: { type: String }
});

module.exports = mongoose.model('BoomboxSystem', boomboxSchema);