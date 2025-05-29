const { SlashCommandBuilder } = require('discord.js');
const PaymentSetup = require('../../schemas/paymentSetup');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('payment-set')
        .setDescription('Tambah atau update metode pembayaran')
        .addStringOption(option =>
            option.setName('method')
                .setDescription('Nama metode pembayaran (cth: Dana, OVO, GoPay, QRIS)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('emoji')
                .setDescription('Emoji untuk tombol (example: 💳)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('number')
                .setDescription('Nomor pembayaran atau ID metode')
                .setRequired(false))
        .addAttachmentOption(option =>
            option.setName('qr')
                .setDescription('Upload gambar QRIS (opsional)')
                .setRequired(false)),

    enabled: false,
    
    async execute(interaction) {
        const { guild, options } = interaction;
        const method = options.getString('method');
        const emoji = options.getString('emoji');
        const number = options.getString('number');
        const qrAttachment = options.getAttachment('qr');

        const qrUrl = qrAttachment?.url || null;

        // Cek validasi minimal isi number atau qr
        if (!number && !qrUrl) {
            return interaction.reply({
                content: 'Kamu harus mengisi nomor pembayaran atau upload gambar QR.',
                ephemeral: true
            });
        }

        let setup = await PaymentSetup.findOne({ GuildID: guild.id });

        if (!setup) {
            setup = new PaymentSetup({
                GuildID: guild.id,
                ChannelID: null,
                Title: null,
                Description: null,
                Payments: [],
            });
        }

        const existingIndex = setup.Payments.findIndex(p => p.Method.toLowerCase() === method.toLowerCase());

        const newData = {
            Method: method,
            Emoji: emoji,
            Number: number || null,
            QR: qrUrl,
        };

        if (existingIndex !== -1) {
            setup.Payments[existingIndex] = newData;
        } else {
            setup.Payments.push(newData);
        }

        await setup.save();

        return interaction.reply({
            content: `Metode pembayaran **${method}** berhasil disimpan!`,
            ephemeral: true
        });
    },
};