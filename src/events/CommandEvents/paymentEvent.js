const { Events, EmbedBuilder } = require('discord.js');
const PaymentSetup = require('../../schemas/paymentSetup');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isButton()) return;
    if (!interaction.customId.startsWith('pay-')) return;

    const { guild, customId } = interaction;

    const setup = await PaymentSetup.findOne({ GuildID: guild.id });
    if (!setup) return;

    const methodKey = customId.replace('pay-', '').toLowerCase();
    const method = setup.Payments.find(p => p.Method.toLowerCase() === methodKey);
    if (!method) {
      return interaction.reply({
        content: `Metode pembayaran tidak ditemukan.`,
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setTitle(`Metode Pembayaran: ${method.Method}`)
      .setColor('Green');

    const hasQR = !!method.QR;
    const hasNumber = !!method.Number;

    if (hasQR && hasNumber) {
      embed.setDescription(`**Nomor / ID:** \`${method.Number}\`\nAtau scan QR berikut:`)
           .setImage(method.QR);
    } else if (hasQR) {
      embed.setDescription(`Silakan scan QR berikut untuk membayar:`)
           .setImage(method.QR);
    } else if (hasNumber) {
      embed.setDescription(`**Nomor / ID:** \`${method.Number}\``);
    } else {
      embed.setDescription(`Tidak ada informasi pembayaran yang tersedia untuk metode ini.`);
    }

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }
};