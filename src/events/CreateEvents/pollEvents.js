const { Events } = require('discord.js');
const pollCommand = require('../../commands/tools/poll'); // ganti path sesuai lokasi file poll.js

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isButton()) return;

    if (interaction.customId.startsWith("poll_")) {
      return pollCommand.handleButton(interaction);
    }
  }
};