const { Suggestion } = require('../../schemas/suggestionSchema');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (!interaction.isButton()) return;
    const [prefix, action, suggestionId] = interaction.customId.split('-');
    if (prefix !== 'suggest') return;

    const suggestion = await Suggestion.findOne({ suggestionId });
    if (!suggestion) return interaction.reply({ content: '❌ Saran tidak ditemukan.', ephemeral: true });

    const userId = interaction.user.id;
    let updated = false;

    if (action === 'upvote') {
      if (!suggestion.upvotes.includes(userId)) {
        suggestion.upvotes.push(userId);
        suggestion.downvotes = suggestion.downvotes.filter(id => id !== userId);
        updated = true;
      }
    } else if (action === 'downvote') {
      if (!suggestion.downvotes.includes(userId)) {
        suggestion.downvotes.push(userId);
        suggestion.upvotes = suggestion.upvotes.filter(id => id !== userId);
        updated = true;
      }
    } else if (action === 'view') {
      return interaction.reply({
        content: `🟩 Upvotes: ${suggestion.upvotes.length > 0 ? suggestion.upvotes.map(id => `<@${id}>`).join(', ') : 'None'}\n🟥 Downvotes: ${suggestion.downvotes.length > 0 ? suggestion.downvotes.map(id => `<@${id}>`).join(', ') : 'None'}`,
        ephemeral: true
      });
    }

    if (updated) {
      const total = suggestion.upvotes.length + suggestion.downvotes.length;
      const upPercent = total ? ((suggestion.upvotes.length / total) * 100).toFixed(1) : '0.0';
      const downPercent = total ? ((suggestion.downvotes.length / total) * 100).toFixed(1) : '0.0';

      const channel = interaction.guild.channels.cache.get(suggestion.channelId);
      const msg = await channel.messages.fetch(suggestion.messageId);

      const updatedEmbed = EmbedBuilder.from(msg.embeds[0])
        .spliceFields(2, 2,
          { name: 'Vote Count', value: `${suggestion.upvotes.length} votes upvotes • ${suggestion.downvotes.length} votes downvotes` },
          { name: 'Vote Distribution', value: `🟩 ${upPercent}% 🟥 ${downPercent}%` }
        );

      await msg.edit({ embeds: [updatedEmbed] });
      await suggestion.save();
    }

    await interaction.reply({ content: '✅ Voting berhasil dicatat.', ephemeral: true });
  }
};