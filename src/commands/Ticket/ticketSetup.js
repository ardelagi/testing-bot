// commands/ticket/ticket-setup.js
const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const TicketSetup = require('../../schemas/ticketSetupSystem');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-setup')
    .setDescription('Setup sistem ticket support.')
    .addChannelOption(opt =>
      opt.setName('channel')
        .setDescription('Channel untuk panel tiket')
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText)
    )
    .addChannelOption(opt =>
      opt.setName('category')
        .setDescription('Kategori tiket akan dibuat di sini')
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildCategory)
    )
    .addChannelOption(opt =>
      opt.setName('transcripts')
        .setDescription('Channel untuk menyimpan transcript tiket')
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText)
    )
    .addChannelOption(opt =>
      opt.setName('logs-channel')
        .setDescription('Channel log tiket')
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText)
    )
    .addRoleOption(opt =>
      opt.setName('handler')
        .setDescription('Role yang dapat mengelola tiket')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('title')
        .setDescription('Judul panel tiket')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('description')
        .setDescription('Deskripsi panel tiket')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('color')
        .setDescription('Warna embed (hex code, contoh: #2f3136)')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const { guild, options } = interaction;

    const data = await TicketSetup.findOne({ GuildID: guild.id });
    if (data) await data.deleteOne();

    await TicketSetup.create({
      GuildID: guild.id,
      Channel: options.getChannel('channel').id,
      Category: options.getChannel('category').id,
      Transcripts: options.getChannel('transcripts').id,
      Logschannel: options.getChannel('logs-channel').id,
      Handlers: options.getRole('handler').id,
      Title: options.getString('title'),
      Description: options.getString('description'),
      Color: options.getString('color') || '#2f3136',
      Options: []
    });

    interaction.reply({ content: 'Berhasil menyimpan pengaturan sistem tiket.', ephemeral: true });
  }
};