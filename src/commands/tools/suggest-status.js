const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require('discord.js');
const { Suggestion } = require('../../schemas/suggestionSchema');

function getColorByStatus(status) {
  switch (status.toLowerCase()) {
    case 'approved': return 0x57F287; // hijau
    case 'denied': return 0xED4245;   // merah
    case 'under review': return 0xFEE75C; // kuning
    case 'pending': return 0x747F8D;  // abu
    default: return 0x2F3136;         // default gelap
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('suggestion-manage')
    .setDescription('Kelola status saran')
    .addStringOption(option =>
      option.setName('suggestion_id')
        .setDescription('ID Saran yang ingin diubah')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('status')
        .setDescription('Status baru dari saran')
        .setRequired(true)
        .addChoices(
          { name: 'Pending', value: 'Pending' },
          { name: 'Approved', value: 'Approved' },
          { name: 'Denied', value: 'Denied' },
          { name: 'Under Review', value: 'Under Review' }
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const suggestionId = interaction.options.getString('suggestion_id');
    const newStatus = interaction.options.getString('status');

    const suggestion = await Suggestion.findOne({ suggestionId });
    if (!suggestion) {
      return interaction.reply({ content: '❌ Saran tidak ditemukan.', ephemeral: true });
    }

    const channel = interaction.guild.channels.cache.get(suggestion.channelId);
    if (!channel) {
      return interaction.reply({ content: '❌ Channel saran tidak ditemukan.', ephemeral: true });
    }

    const message = await channel.messages.fetch(suggestion.messageId).catch(() => null);
    if (!message) {
      return interaction.reply({ content: '❌ Pesan saran tidak ditemukan.', ephemeral: true });
    }

    const oldEmbed = message.embeds[0];
    if (!oldEmbed) {
      return interaction.reply({ content: '❌ Embed tidak ditemukan di pesan.', ephemeral: true });
    }

    const updatedEmbed = EmbedBuilder.from(oldEmbed)
      .setColor(getColorByStatus(newStatus))
      .setFields(
        oldEmbed.fields.map(field =>
          field.name === 'Status'
            ? { name: 'Status', value: `\`${newStatus}\`` }
            : field
        )
      )
      .setTimestamp();

    await message.edit({ embeds: [updatedEmbed] });

    suggestion.status = newStatus;
    await suggestion.save();

    interaction.reply({ content: `✅ Status saran berhasil diubah menjadi **${newStatus}**.`, ephemeral: true });
  }
};