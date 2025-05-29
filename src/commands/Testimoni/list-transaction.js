const { SlashCommandBuilder, AttachmentBuilder, PermissionFlagsBits } = require('discord.js');
const Testimoni = require('../../schemas/testimoni');
const { createCanvas } = require('canvas');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('list-transaction')
    .setDescription('Tampilkan daftar buyer dan jumlah transaksinya.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  enabled: false,
  
  async execute(interaction) {
    const { guild, client } = interaction;

    const buyers = await Testimoni.find({ Guild: guild.id });
    const buyerList = buyers.filter(data => data.Buyer && typeof data.Transactions === 'number');

    if (buyerList.length === 0) {
      return interaction.reply({ content: '❌ Tidak ada data buyer yang ditemukan.', ephemeral: true });
    }

    // Sort by most transactions
    buyerList.sort((a, b) => b.Transactions - a.Transactions);

    // Canvas size
    const canvasWidth = 1000;
    const rowHeight = 70;
    const paddingBottom = 100;
    const canvasHeight = 100 + rowHeight * buyerList.length + paddingBottom;

    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#111111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 40px Poppins';
    ctx.fillText('Daftar Buyer & Transaksi', 50, 60);

    // Header row
    ctx.font = 'bold 28px Poppins';
    ctx.fillStyle = '#aaaaaa';
    ctx.fillText('#', 50, 110);
    ctx.fillText('Username', 100, 110);
    ctx.fillText('Transaksi', 800, 110);

    // List
    ctx.font = '28px Poppins';
    ctx.fillStyle = '#cccccc';

    for (let i = 0; i < buyerList.length; i++) {
      const data = buyerList[i];
      const user = await client.users.fetch(data.Buyer).catch(() => null);
      const tag = user ? user.tag : `ID: ${data.Buyer}`;
      const y = 160 + i * rowHeight;

      ctx.fillText(`${i + 1}`, 50, y);
      ctx.fillText(tag, 100, y);
      ctx.fillText(`${data.Transactions}x`, 850, y);
    }

    // Total buyer
    ctx.font = 'bold 30px Poppins';
    ctx.fillStyle = '#00ff88';
    ctx.fillText(`Total Buyer: ${buyerList.length}`, 50, canvasHeight - 40);

    // Kirim sebagai attachment
    const buffer = canvas.toBuffer('image/png');
    const attachment = new AttachmentBuilder(buffer, { name: 'list-buyer.png' });

    return interaction.reply({ files: [attachment] });
  },
};