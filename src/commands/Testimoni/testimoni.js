const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const Testimoni = require('../../schemas/testimoni');
const { createCanvas, loadImage } = require('canvas');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('testimoni')
    .setDescription('Send a testimonial proof of transaction.')
    .addUserOption(option =>
      option.setName('seller').setDescription('The seller you want to rate.').setRequired(true))
    .addUserOption(option =>
      option.setName('buyer').setDescription('The buyer you want to rate.').setRequired(true))
    .addNumberOption(option =>
      option.setName('price').setDescription('The price of the product.').setRequired(true))
    .addStringOption(option =>
      option.setName('product').setDescription('The name of the product.').setRequired(true))
    .addAttachmentOption(option =>
      option.setName('image').setDescription('Proof image for the transaction.').setRequired(true)),

  enabled: false,

  async execute(interaction) {
    const { options, guild, member } = interaction;
    const seller = options.getUser('seller');
    const buyer = options.getUser('buyer');
    const price = options.getNumber('price');
    const product = options.getString('product');
    const image = options.getAttachment('image');

    if (!price || isNaN(price) || price < 0) {
      return interaction.reply({ content: '❌ Harga tidak valid.', ephemeral: true });
    }

    const formattedPrice = parseFloat(price).toLocaleString('id-ID');
    const guildData = await Testimoni.findOne({ Guild: guild.id });
    if (!guildData || !guildData.Channel || !guildData.SellerRole) {
      return interaction.reply({ content: '❌ Setup belum lengkap. Gunakan `/setup-testimoni`.', ephemeral: true });
    }

    const sellerRole = guildData.SellerRole;
    if (!member.roles.cache.has(sellerRole)) {
      return interaction.reply({ content: '❌ Kamu tidak memiliki role seller.', ephemeral: true });
    }

    let buyerData = await Testimoni.findOne({ Guild: guild.id, Buyer: buyer.id });
    if (buyerData) {
      buyerData.Transactions += 1;
      await buyerData.save();
    } else {
      await Testimoni.create({ Guild: guild.id, Buyer: buyer.id, Transactions: 1 });
    }

    const transactionCount = buyerData ? buyerData.Transactions : 1;

    // Load image proof
    const response = await axios.get(image.url, { responseType: 'arraybuffer' });
    const proofImage = await loadImage(Buffer.from(response.data, 'binary'));

    // Load avatar
    const avatarURL = seller.displayAvatarURL({ extension: 'png', size: 128 });
    const avatarResponse = await axios.get(avatarURL, { responseType: 'arraybuffer' });
    const avatarImage = await loadImage(Buffer.from(avatarResponse.data, 'binary'));

    const canvasWidth = 1000;
    const scale = proofImage.width > 900 ? 0.9 : 1;
    const imageWidth = Math.min(proofImage.width * scale, canvasWidth - 80);
    const imageHeight = proofImage.height * (imageWidth / proofImage.width);
    const canvasHeight = 400 + imageHeight;

    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#0e0e0e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 40px Poppins';
    ctx.fillText('Testimonial Transaction', 50, 70);

    // Info
    ctx.font = '28px Poppins';
    ctx.fillText(`Buyer: ${buyer.tag} (${transactionCount}x Buy)`, 50, 130);
    ctx.fillText(`Seller: ${seller.tag}`, 50, 180);
    ctx.fillText(`Product: ${product}`, 50, 230);
    ctx.fillText(`Price: Rp ${formattedPrice}`, 50, 280);

    // Draw seller avatar
    const avatarSize = 100;
    const avatarX = canvasWidth - avatarSize - 50;
    const avatarY = 50;

    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatarImage, avatarX, avatarY, avatarSize, avatarSize);
    ctx.restore();

    // Draw proof image
    ctx.drawImage(proofImage, 50, 350, imageWidth, imageHeight);

    // Send image
    const buffer = canvas.toBuffer('image/png');
    const attachment = new AttachmentBuilder(buffer, { name: 'testimoni.png' });

    const testimoniChannel = guild.channels.cache.get(guildData.Channel);
    if (!testimoniChannel) {
      return interaction.reply({ content: '❌ Channel testimoni tidak ditemukan.', ephemeral: true });
    }

    testimoniChannel.send({ files: [attachment] });
    return interaction.reply({ content: `✅ Testimoni berhasil dikirim ke ${testimoniChannel}!`, ephemeral: true });
  },
};