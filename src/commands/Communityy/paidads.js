const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');
const adsSystem = require('../../schemas/adsSystem');
const ms = require('ms');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ads')
        .setDescription('Membuat sistem PaidAds untuk pembeli PaidAds di server ini.')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Tentukan channel PaidAds yang diinginkan oleh pembeli.')
                .setRequired(true))
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Tentukan user yang membeli PaidAds.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('duration')
                .setDescription('Durasi PaidAds (misal: 1d, 2h).')
                .setRequired(true)),

    enabled: false,

    async execute(interaction) {
        // Cek permission Admin
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({
                content: '❌ Anda tidak memiliki izin untuk menggunakan perintah ini.',
                ephemeral: true,
            });
        }

        const { guild, options, user } = interaction;

        const channel = options.getChannel('channel');
        const targetUser = options.getUser('user');
        const duration = options.getString('duration');

        // Validasi input
        if (!ms(duration)) {
            return interaction.reply({ content: '❌ Format durasi tidak valid. Gunakan contoh seperti `1d`, `2h`, dll.', ephemeral: true });
        }

        if (!channel.isTextBased()) {
            return interaction.reply({ content: '❌ Channel yang dipilih harus berupa text channel.', ephemeral: true });
        }

        const member = guild.members.cache.get(targetUser.id);
        if (!member) {
            return interaction.reply({ content: '❌ User tidak ditemukan di server ini.', ephemeral: true });
        }

        const endTimestamp = Date.now() + ms(duration);
        const roleName = `PaidAds_${channel.name}`;
        let role = guild.roles.cache.find(r => r.name === roleName);

        try {
            if (!role) {
                role = await guild.roles.create({
                    name: roleName,
                    color: '#FF5733',
                    reason: `Role PaidAds untuk channel ${channel.name}`,
                });
            }

            await member.roles.add(role);
            await channel.permissionOverwrites.edit(role, {
                ViewChannel: true,
                SendMessages: true,
            });

            const adsEmbed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('System PaidAds')
                .setDescription(`**Administrator:** ${user.tag}\n**Durasi:** ${duration}`)
                .addFields({ name: 'Berakhir', value: `<t:${Math.floor(endTimestamp / 1000)}:R>`, inline: true })
                .setFooter({ text: `Administrator by ${user.tag}` });

            const adMessage = await channel.send({ content: `${targetUser}`, embeds: [adsEmbed] });

            // Simpan ke database
            await adsSystem.create({
                guildId: guild.id,
                messageId: adMessage.id,
                channelId: channel.id,
                userId: targetUser.id,
                userTag: targetUser.tag,
                duration: duration,
                endTimestamp: endTimestamp,
                roleId: role.id,
            });

            setTimeout(async () => {
                try {
                    const data = await adsSystem.findOne({ guildId: guild.id, messageId: adMessage.id });
                    if (!data) return;

                    if (member.roles.cache.has(role.id)) {
                        await member.roles.remove(role);
                    }

                    await channel.permissionOverwrites.edit(role, {
                        ViewChannel: false,
                        SendMessages: false,
                    });

                    const expiredEmbed = new EmbedBuilder()
                        .setColor('#ff0000')
                        .setTitle('PaidAds Expired')
                        .setDescription(`PaidAds dari ${targetUser.tag} telah berakhir.`)
                        .setFooter({ text: `Administrator by ${user.tag}` });

                    await adMessage.edit({ embeds: [expiredEmbed] });

                    try {
                        await targetUser.send({
                            content: `Halo, ${targetUser.username}. Masa PaidAds Anda di channel **${channel.name}** telah berakhir. Terima kasih telah menggunakan layanan kami.`,
                        });
                    } catch (err) {
                        console.error(`Tidak bisa mengirim DM ke ${targetUser.tag}:`, err.message);
                    }

                    await adsSystem.deleteOne({ guildId: guild.id, messageId: adMessage.id });

                    if (role && role.deletable) {
                        await role.delete('PaidAds expired, role removed.');
                    }
                } catch (error) {
                    console.error('Error handling PaidAds expiration:', error);
                }
            }, ms(duration));

            return interaction.reply({
                content: '✅ PaidAds berhasil dibuat dan akses diberikan ke user.',
                ephemeral: true,
            });
        } catch (error) {
            console.error('[PaidAds Command] Error:', error);
            return interaction.reply({
                content: '❌ Terjadi kesalahan saat menjalankan PaidAds.',
                ephemeral: true,
            });
        }
    },
};