const { SlashCommandBuilder, ChannelType } = require('discord.js');
const WelcomeSystem = require('../../schemas/welcomeSchema');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-welcome')
    .setDescription('Setup welcome and goodbye system')
    .addChannelOption(opt =>
      opt.setName('welcome_channel')
        .setDescription('Channel for welcome')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true))
    .addChannelOption(opt =>
      opt.setName('goodbye_channel')
        .setDescription('Channel for goodbye')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)),
  async execute(interaction) {
    const welcomeChannel = interaction.options.getChannel('welcome_channel');
    const goodbyeChannel = interaction.options.getChannel('goodbye_channel');

    await WelcomeSystem.findOneAndUpdate(
      { guildId: interaction.guild.id },
      {
        guildId: interaction.guild.id,
        welcomeChannelId: welcomeChannel.id,
        goodbyeChannelId: goodbyeChannel.id
      },
      { upsert: true }
    );

    await interaction.reply({ content: `Welcome & Goodbye system telah disetup!`, ephemeral: true });
  }
};