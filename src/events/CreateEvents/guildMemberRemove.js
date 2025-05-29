const { createCanvas, loadImage } = require('canvas');
const { AttachmentBuilder } = require('discord.js');
const WelcomeSystem = require('../../schemas/welcomeSchema');

module.exports = {
  name: 'guildMemberRemove',
  async execute(member) {
    const data = await WelcomeSystem.findOne({ guildId: member.guild.id });
    if (!data) return;

    const canvas = createCanvas(1024, 450);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#23272a'; // Solid background
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 4;

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 50px sans-serif';
    ctx.fillText('Selamat Tinggal!', 350, 80);

    ctx.font = '38px sans-serif';
    ctx.fillText(`${member.user.username}`, 370, 150);

    ctx.font = '28px sans-serif';
    ctx.fillText(`Semoga kembali ke server kami!`, 370, 210);

    ctx.beginPath();
    ctx.arc(175, 200, 110, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    const avatar = await loadImage(member.user.displayAvatarURL({ extension: 'jpg', size: 256 }));
    ctx.save();
    ctx.beginPath();
    ctx.arc(175, 200, 100, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, 75, 100, 200, 200);
    ctx.restore();

    const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'goodbye.png' });
    const channel = member.guild.channels.cache.get(data.goodbyeChannelId);
    if (channel) channel.send({ content: `${member.user.username} telah keluar.`, files: [attachment] });
  }
};