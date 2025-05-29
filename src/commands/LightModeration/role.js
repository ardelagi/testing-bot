const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('role')
    .setDescription('Manage roles for a user.')
    .addSubcommand(subcommand =>
      subcommand
        .setName('add')
        .setDescription('Add a role to a user.')
        .addUserOption(option =>
          option.setName('user')
            .setDescription('The user to add the role to.')
            .setRequired(true))
        .addRoleOption(option =>
          option.setName('role')
            .setDescription('The role to add.')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('remove')
        .setDescription('Remove a role from a user.')
        .addUserOption(option =>
          option.setName('user')
            .setDescription('The user to remove the role from.')
            .setRequired(true))
        .addRoleOption(option =>
          option.setName('role')
            .setDescription('The role to remove.')
            .setRequired(true))),

  async execute(interaction) {
    const { options, guild, member } = interaction;

    // Cek jika pengguna memiliki izin Administrator
    if (!member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        content: '❌ Kamu tidak memiliki izin Administrator untuk menggunakan perintah ini.',
        ephemeral: true
      });
    }

    const subcommand = options.getSubcommand();
    const user = options.getUser('user');
    const role = options.getRole('role');

    // Embed dasar
    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTimestamp();

    if (subcommand === 'add') {
      // Add role to user
      const targetMember = await guild.members.fetch(user.id);
      if (targetMember.roles.cache.has(role.id)) {
        embed.setTitle('Gagal Menambahkan Role')
          .setDescription(`${user.tag} sudah memiliki role ${role.name}.`)
          .setColor('#ff0000');
        return interaction.reply({ embeds: [embed] });
      }

      await targetMember.roles.add(role);
      embed.setTitle('Role Ditambahkan')
        .setDescription(`✅ Role ${role.name} telah berhasil ditambahkan ke ${user.tag}.`)
        .setColor('#00ff00');
      return interaction.reply({ embeds: [embed] });
    }

    if (subcommand === 'remove') {
      // Remove role from user
      const targetMember = await guild.members.fetch(user.id);
      if (!targetMember.roles.cache.has(role.id)) {
        embed.setTitle('Gagal Menghapus Role')
          .setDescription(`${user.tag} tidak memiliki role ${role.name}.`)
          .setColor('#ff0000');
        return interaction.reply({ embeds: [embed] });
      }

      await targetMember.roles.remove(role);
      embed.setTitle('Role Dihapus')
        .setDescription(`✅ Role ${role.name} telah berhasil dihapus dari ${user.tag}.`)
        .setColor('#00ff00');
      return interaction.reply({ embeds: [embed] });
    }
  },
};