const { createCanvas, loadImage } = require('canvas');
const { AttachmentBuilder } = require('discord.js');
const WelcomeSystem = require('../../schemas/welcomeSchema');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    const data = await WelcomeSystem.findOne({ guildId: member.guild.id });
    if (!data) return;


    const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'welcome.png' });
    const channel = member.guild.channels.cache.get(data.welcomeChannelId);
    if (channel) channel.send({ content: `**Selamat datang <@${member.id}> di ${member.guild}** 
Semoga kamu bisa merasa nyaman di kota ini dan menjadi bagian dari cerita besar kota ini.`, files: [attachment] });
  }
};