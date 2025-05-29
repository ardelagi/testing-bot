const { SlashCommandBuilder } = require('discord.js');
const PaymentSetup = require('../../schemas/paymentSetup');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delete-payment')
        .setDescription('Hapus metode pembayaran')
        .addStringOption(option =>
            option.setName('method')
                .setDescription('Nama metode yang ingin dihapus')
                .setRequired(true)),

    enabled: false,

    async execute(interaction) {
        const method = interaction.options.getString('method');
        const setup = await PaymentSetup.findOne({ GuildID: interaction.guild.id });

        if (!setup) return interaction.reply({ content: 'Tidak ada data pembayaran.', ephemeral: true });

        const before = setup.Payments.length;
        setup.Payments = setup.Payments.filter(p => p.Method.toLowerCase() !== method.toLowerCase());
        
        if (setup.Payments.length === before) {
            return interaction.reply({ content: `Metode **${method}** tidak ditemukan.`, ephemeral: true });
        }

        await setup.save();
        return interaction.reply({ content: `Metode **${method}** berhasil dihapus.`, ephemeral: true });
    }
};