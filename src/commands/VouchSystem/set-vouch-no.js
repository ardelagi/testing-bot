const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const Rating = require("../../schemas/vouchSystem");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-vouch-number')
        .setDescription('Set the Vouch No for a specific guild.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // Hanya boleh digunakan oleh Administrator
        .addStringOption(option =>
            option.setName('guild')
                .setDescription('Nama atau ID guild')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('vouchno')
                .setDescription('Jumlah Vouch yang ingin diset')
                .setRequired(true)
        ),

    enabled: false,
    
    async execute(interaction) {
        const guildName = interaction.options.getString('guild');
        const vouchNo = interaction.options.getInteger('vouchno');

        // Pastikan pengguna adalah admin
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setDescription("❌ Anda tidak memiliki izin untuk menggunakan command ini. Hanya Administrator yang diperbolehkan.")
                        .setTimestamp()
                ],
                ephemeral: true
            });
        }

        // Cek apakah data rating guild ada
        const ratingData = await Rating.findOne({ Guild: guildName });
        if (!ratingData) {
            return interaction.reply({
                content: `Tidak ditemukan data untuk guild dengan nama ${guildName}.`,
                ephemeral: true
            });
        }

        // Update nilai VouchNo
        ratingData.VouchNo = vouchNo;
        await ratingData.save();

        // Kirim respons konfirmasi
        return interaction.reply({
            content: `✅ Jumlah Vouch No untuk guild ${guildName} berhasil diperbarui menjadi ${vouchNo}.`,
            ephemeral: true
        });
    }
};