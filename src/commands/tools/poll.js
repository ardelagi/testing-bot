// commands/tools/poll.js
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require('discord.js');
const pollVotes = new Map();

module.exports = {
  premiumOnly: false,
  moderatorOnly: true,
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Create a button-based poll.')
    .setDMPermission(false)
    .addStringOption(option =>
      option.setName('title').setDescription('Title of the poll.').setRequired(true))
    .addStringOption(option =>
      option.setName('description').setDescription('Description of the poll.').setRequired(true))
    .addIntegerOption(option =>
      option.setName('duration').setDescription('Duration in minutes.').setMinValue(1).setRequired(true))
    .addChannelOption(option =>
      option.setName('channel').setDescription('Target channel.').addChannelTypes(ChannelType.GuildText).setRequired(false)),

  async execute(interaction) {
    const { options, guild, channel } = interaction;

    const title = options.getString("title");
    const description = options.getString("description");
    const duration = options.getInteger("duration");
    const targetChannel = options.getChannel("channel") || channel;

    const pollId = `${guild.id}-${Date.now()}`;
    pollVotes.set(pollId, { yes: new Set(), no: new Set() });

    const embed = new EmbedBuilder()
      .setColor('#2f3136')
      .setTitle(title)
      .setDescription(description)
      .setFooter({ text: `Poll ends in ${duration} minute(s)` })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`poll_yes_${pollId}`).setLabel('✅ Yes').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`poll_no_${pollId}`).setLabel('❌ No').setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId(`poll_result_${pollId}`).setLabel('📊 Check Votes').setStyle(ButtonStyle.Secondary),
    );

    const msg = await targetChannel.send({ embeds: [embed], components: [row] });
    await interaction.reply({ content: `✅ Poll sent to ${targetChannel}`, ephemeral: true });

    setTimeout(async () => {
      const votes = pollVotes.get(pollId);
      if (!votes) return;

      const resultEmbed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle(`Poll Ended: ${title}`)
        .setDescription(description)
        .addFields(
          { name: "✅ Yes", value: `${votes.yes.size} vote(s)`, inline: true },
          { name: "❌ No", value: `${votes.no.size} vote(s)`, inline: true }
        )
        .setTimestamp();

      pollVotes.delete(pollId);
      await msg.edit({ embeds: [resultEmbed], components: [] });
    }, duration * 60000);
  },

  // Fungsi handler tombol
  async handleButton(interaction) {
    const [_, action, pollId] = interaction.customId.split('_');
    const votes = pollVotes.get(pollId);
    if (!votes) return interaction.reply({ content: "This poll has ended or is invalid.", ephemeral: true });

    if (action === "yes") {
      votes.no.delete(interaction.user.id);
      votes.yes.add(interaction.user.id);
      return interaction.reply({ content: "You voted ✅ Yes!", ephemeral: true });
    }

    if (action === "no") {
      votes.yes.delete(interaction.user.id);
      votes.no.add(interaction.user.id);
      return interaction.reply({ content: "You voted ❌ No!", ephemeral: true });
    }

    if (action === "result") {
      const yesVoters = [...votes.yes].map(id => `<@${id}>`).join("\n") || "None";
      const noVoters = [...votes.no].map(id => `<@${id}>`).join("\n") || "None";

      const embed = new EmbedBuilder()
        .setTitle("Current Poll Votes")
        .addFields(
          { name: "✅ Yes", value: yesVoters, inline: true },
          { name: "❌ No", value: noVoters, inline: true }
        )
        .setColor("Blurple");

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
};