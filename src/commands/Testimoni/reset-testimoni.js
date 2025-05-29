const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const Testimoni = require('../../schemas/testimoni');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reset-testimoni')
        .setDescription('Reset buyer transaction data.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option =>
            option.setName('buyer')
                .setDescription('The buyer whose data you want to reset.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('action')
                .setDescription('Choose to reset transactions or delete buyer data.')
                .setRequired(true)
                .addChoices(
                    { name: 'Reset Transactions', value: 'reset' },
                    { name: 'Delete Buyer Data', value: 'delete' }
                )),

    enabled: false,

    async execute(interaction) {
        const { options, guild } = interaction;

        const buyer = options.getUser('buyer');
        const action = options.getString('action');

        // Ambil data buyer (bukan data setup)
        const buyerData = await Testimoni.findOne({ Guild: guild.id, Buyer: buyer.id });

        if (!buyerData || typeof buyerData.Transactions !== 'number') {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#FF0000')
                        .setDescription(`❌ Data transaksi untuk pembeli **${buyer.tag}** tidak ditemukan.`),
                ],
                ephemeral: true,
            });
        }

        if (action === 'reset') {
            buyerData.Transactions = 0;
            await buyerData.save();

            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#00FF00')
                        .setDescription(`✅ Jumlah transaksi untuk pembeli **${buyer.tag}** telah direset ke **0**.`),
                ],
                ephemeral: true,
            });
        }

        if (action === 'delete') {
            await Testimoni.deleteOne({ Guild: guild.id, Buyer: buyer.id });

            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#00FF00')
                        .setDescription(`✅ Data pembeli **${buyer.tag}** berhasil dihapus dari database.`),
                ],
                ephemeral: true,
            });
        }
    },
};