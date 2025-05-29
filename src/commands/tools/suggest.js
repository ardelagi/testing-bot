const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const { Suggestion, SuggestionChannel } = require('../../schemas/suggestionSchema');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('suggest')
    .setDescription('Kirimkan saran kamu ke server')
    .addStringOption(option => option.setName('saran').setDescription('Isi saran kamu').setRequired(true)),

  async execute(interaction) {
    const suggestionText = interaction.options.getString('saran');
    const config = await SuggestionChannel.findOne({ guildId: interaction.guild.id });

    if (!config) {
      return interaction.reply({ content: 'Channel saran belum diatur oleh admin.', ephemeral: true });
    }

    const channel = interaction.guild.channels.cache.get(config.channelId);
    if (!channel) {
      return interaction.reply({ content: 'Channel saran tidak ditemukan.', ephemeral: true });
    }

    const suggestionId = interaction.id;

    const suggestionEmbed = new EmbedBuilder()
      .setTitle('📩 New Suggestions')
      .addFields(
        { name: 'Suggestion', value: suggestionText },
        { name: 'Status', value: '`Pending`' },
        { name: 'Vote Count', value: '0 votes upvotes • No votes downvotes' },
        { name: 'Vote Distribution', value: '🟩 0.0% 🟥 0.0%' },
        { name: 'Author', value: `<@${interaction.user.id}> (${interaction.user.tag})` }
      )
      .setColor('DarkButNotBlack')
      .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
      .setFooter({ text: `Suggestion ID: ${suggestionId}` })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`suggest-upvote-${suggestionId}`).setLabel('👍 Upvote').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`suggest-downvote-${suggestionId}`).setLabel('👎 Downvote').setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId(`suggest-view-${suggestionId}`).setLabel('🗨️ View Votes').setStyle(ButtonStyle.Secondary),
    );

    const message = await channel.send({ embeds: [suggestionEmbed], components: [row] });

    await new Suggestion({
      suggestionId,
      guildId: interaction.guild.id,
      channelId: channel.id,
      messageId: message.id,
      userId: interaction.user.id,
      suggestion: suggestionText
    }).save();

    interaction.reply({ content: '✅ Saran kamu telah dikirim!', ephemeral: true });
  }
};