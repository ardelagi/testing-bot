const {
  Events,
  ChannelType,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
} = require("discord.js");
const TicketSchema = require("../../schemas/ticketSystem");
const TicketSetup = require("../../schemas/ticketSetupSystem");
const TicketCounterSchema = require("../../schemas/ticketCounter");

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction, client) {
    const { guild, member } = interaction;
    const { ViewChannel, SendMessages, ManageChannels, ReadMessageHistory } = PermissionFlagsBits;

    // Tangani Select Menu tiket
    if (!interaction.isStringSelectMenu()) return;
    if (interaction.customId !== "ticket-select") return;

    const ticketType = interaction.values[0]; // Isi dari value opsi yang dipilih user

    // Ambil data konfigurasi sistem tiket
    const data = await TicketSetup.findOne({ GuildID: guild.id });
    if (!data) return;

    // Cek jika user sudah punya tiket
    const alreadyTicket = await TicketSchema.findOne({ GuildID: guild.id, OwnerID: member.id });
    if (alreadyTicket) {
      const embed = new EmbedBuilder()
        .setDescription(client.config.ticketAlreadyExist || "You already have a ticket.")
        .setColor("Red");
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (!guild.members.me.permissions.has(ManageChannels)) {
      return interaction.reply({
        content: client.config.ticketMissingPerms || "Missing permissions to create channels.",
        ephemeral: true,
      });
    }

    try {
      await interaction.deferReply({ ephemeral: true });

      // Dapatkan dan perbarui counter tiket
      let ticketCounter = await TicketCounterSchema.findOne({ GuildID: guild.id });
      if (!ticketCounter) {
        ticketCounter = await TicketCounterSchema.create({ GuildID: guild.id, LastTicketID: 0 });
      }
      const ticketId = ticketCounter.LastTicketID + 1;
      ticketCounter.LastTicketID = ticketId;
      await ticketCounter.save();

      // Buat channel tiket
      const newChannel = await guild.channels.create({
        name: `${client.config.ticketName || "ticket-"}${ticketId}`,
        type: ChannelType.GuildText,
        parent: data.Category,
        permissionOverwrites: [
          {
            id: guild.id,
            deny: [ViewChannel, SendMessages, ReadMessageHistory],
          },
          {
            id: data.Handlers,
            allow: [ViewChannel, SendMessages, ReadMessageHistory, ManageChannels],
          },
          {
            id: member.id,
            allow: [ViewChannel, SendMessages, ReadMessageHistory],
          },
        ],
      });

      await TicketSchema.create({
        GuildID: guild.id,
        OwnerID: member.id,
        MemberID: member.id,
        TicketID: ticketId,
        ChannelID: newChannel.id,
        Locked: false,
        Claimed: false,
      });

      await newChannel.setTopic(`${client.config.ticketDescription || "Ticket for"} <@${member.id}>`);

      const embed = new EmbedBuilder()
        .setTitle(client.config.ticketMessageTitle || "Ticket Created")
        .setDescription(
          `${client.config.ticketMessageDescription || "Please wait for a staff member."}\n\n` +
          `**Ticket ID:** ${ticketId}\n**Ticket Owner:** <@${member.id}>\n**Ticket Type:** ${ticketType}\n` +
          `Time At: <t:${parseInt(Date.now() / 1000)}:F>`
        )
        .setColor("Blue");

      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("ticket-close").setLabel("Close").setStyle(ButtonStyle.Danger).setEmoji("🔒"),
        new ButtonBuilder().setCustomId("ticket-lock").setLabel("Lock").setStyle(ButtonStyle.Secondary).setEmoji("🔐"),
        new ButtonBuilder().setCustomId("ticket-unlock").setLabel("Unlock").setStyle(ButtonStyle.Secondary).setEmoji("🔓"),
        new ButtonBuilder().setCustomId("ticket-manage").setLabel("Add-users").setStyle(ButtonStyle.Secondary).setEmoji("➕"),
        new ButtonBuilder().setCustomId("ticket-claim").setLabel("Claim").setStyle(ButtonStyle.Primary).setEmoji("✅")
      );

      await newChannel.send({
        content: `<@${member.id}> <@&${data.Handlers}>`,
        embeds: [embed],
        components: [buttons],
      });

      // Auto ping + hapus ping
      const ping = await newChannel.send({ content: `<@&${data.Handlers}>` });
      ping.delete().catch(() => { });

      // DM user bahwa tiket telah dibuat
      const confirmation = new EmbedBuilder()
        .setDescription(`${client.config.ticketCreate || "Ticket created"} <#${newChannel.id}>`)
        .setColor("Green");
      await interaction.followUp({ embeds: [confirmation] });

      // Kirim log ke channel log
      const logEmbed = new EmbedBuilder()
        .setTitle("Ticket Created")
        .setColor("Green")
        .addFields(
          { name: "Ticket Name", value: `[${newChannel.name}](${newChannel.url})`, inline: true },
          { name: "Ticket Owner", value: `<@${member.id}>`, inline: true },
          { name: "Time At", value: `<t:${parseInt(Date.now() / 1000)}:F>`, inline: true },
          { name: "Ticket Type", value: ticketType, inline: true }
        );

      if (data.Logschannel) {
        const logChannel = guild.channels.cache.get(data.Logschannel);
        if (logChannel) {
          await logChannel.send({ embeds: [logEmbed] });
        }
      }
    } catch (err) {
      console.error(`[TICKET_SYSTEM] Error creating ticket in ${guild.name}:`, err);
      if (!interaction.replied) {
        await interaction.followUp({
          content: "An error occurred while creating the ticket.",
          ephemeral: true,
        });
      }
    }
  },
};