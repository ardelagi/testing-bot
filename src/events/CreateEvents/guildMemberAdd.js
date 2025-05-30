const { createCanvas, loadImage } = require('canvas');
const { AttachmentBuilder } = require('discord.js');
const WelcomeSystem = require('../../schemas/welcomeSchema');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    const data = await WelcomeSystem.findOne({ guildId: member.guild.id });
    if (!data) return;

    const canvas = createCanvas(1024, 450);
    const ctx = canvas.getContext('2d');

    // Background solid color
    ctx.fillStyle = '#080807'; // Dark grey
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Shadow
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 4;

    // Title
    ctx.fillStyle = '#07c1f5';
    ctx.font = 'bold 50px sans-serif';
    ctx.fillText(`Selamat Datang di
MOTIONLIFE ROLEPLAY`, 320, 80);

    // Username
    ctx.font = '38px sans-serif';
    ctx.fillText(`@${member.user.username}`, 320, 200);

    // Member Count
    ctx.font = '28px sans-serif';
    ctx.fillText(`Kamu member ke #${member.guild.memberCount}`, 320, 250);

    // Avatar Border
    ctx.beginPath();
    ctx.arc(175, 200, 110, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = '#07c1f5';
    ctx.fill();

    // Avatar Circle
    const avatar = await loadImage(member.user.displayAvatarURL({ extension: 'jpg', size: 256 }));
    ctx.save();
    ctx.beginPath();
    ctx.arc(175, 200, 100, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, 75, 100, 200, 200);
    ctx.restore();

    const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'welcome.png' });
    const channel = member.guild.channels.cache.get(data.welcomeChannelId);
    if (channel) channel.send({ content: `Selamat datang <@${member.id}> 
Semoga kamu bisa merasa nyaman di kota ini dan menjadi bagian dari cerita besar kota ini.`, files: [attachment] });
  }
};