const { SlashCommandBuilder } = require('discord.js');
const PaymentSetup = require('../../schemas/paymentSetup');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('change-number-payment')
        .setDescription('Ubah nomor pembayaran metode tertentu')
        .addStringOption(option =>
            option.setName('method')
                .setDescription('Nama metode yang ingin diubah')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('newnumber')
                .setDescription('Nomor baru')
                .setRequired(true)),

enabled: false,

    async execute(interaction) {
        const method = interaction.options.getString('method');
        const newNumber = interaction.options.getString('newnumber');
        const setup = await PaymentSetup.findOne({ GuildID: interaction.guild.id });

        if (!setup) return interaction.reply({ content: 'Belum ada pengaturan pembayaran.', ephemeral: true });

        const payment = setup.Payments.find(p => p.Method.toLowerCase() === method.toLowerCase());
        if (!payment) return interaction.reply({ content: 'Metode tidak ditemukan.', ephemeral: true });

        if (payment.Method.toLowerCase() === 'qris') {
            return interaction.reply({ content: 'QRIS tidak menggunakan nomor.', ephemeral: true });
        }

        payment.Number = newNumber;
        await setup.save();

        return interaction.reply({ content: `Nomor untuk **${method}** berhasil diubah.`, ephemeral: true });
    }
};