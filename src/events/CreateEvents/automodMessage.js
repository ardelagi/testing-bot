const { Events, EmbedBuilder } = require('discord.js');
const AutoMod = require('../../schemas/automodSchema');
const warningSchema = require('../../schemas/warningSystem'); // kamu bisa pakai schema warning kamu yang sudah ada

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (!message.guild || message.author.bot) return;

    const config = await AutoMod.findOne({ GuildID: message.guild.id });
    if (!config || !config.Enabled) return;

    const msg = message.content.toLowerCase();
    const badWords = config.BadWords;
    const hasBadWord = badWords.some(w => msg.includes(w));

    const excessiveCaps = /[A-Z\s]{10,}/.test(message.content);
    const repeatChars = /(.)\1{6,}/.test(message.content); // huruf yang diulang lebih dari 6 kali

    let reason = null;

    if (hasBadWord) reason = 'Menggunakan kata kasar';
    else if (excessiveCaps) reason = 'Terlalu banyak CAPS LOCK';
    else if (repeatChars) reason = 'Spam karakter berulang';

    if (reason) {
      await message.delete().catch(() => {});

      // Tambah warning ke database
      const user = message.author;
      let warnData = await warningSchema.findOne({ GuildID: message.guild.id, UserID: user.id });
      if (!warnData) {
        warnData = new warningSchema({
          GuildID: message.guild.id,
          UserID: user.id,
          UserTag: user.tag,
          Content: [],
        });
      }

      warnData.Content.push({
        ExecuterId: 'AutoMod',
        ExecuterTag: 'Auto Moderator',
        Reason: reason,
      });

      await warnData.save();

      const warnCount = warnData.Content.length;

      // Kirim DM
      user.send(`Kamu telah diperingatkan di server **${message.guild.name}** karena: **${reason}**. Total peringatan: ${warnCount}`).catch(() => {});

      // Kirim log ke log channel (jika diatur)
      if (config.LogChannelID) {
        const logChannel = message.guild.channels.cache.get(config.LogChannelID);
        if (logChannel) {
          const embed = new EmbedBuilder()
            .setTitle('AutoMod - Pelanggaran Terdeteksi')
            .addFields(
              { name: 'User', value: `<@${user.id}> (${user.tag})`, inline: true },
              { name: 'Alasan', value: reason, inline: true },
              { name: 'Jumlah Peringatan', value: `${warnCount}`, inline: true },
            )
            .setColor('Red')
            .setTimestamp();

          logChannel.send({ embeds: [embed] });
        }
      }

      // Ambil tindakan jika melebihi batas
      if (warnCount >= config.WarnLimit) {
        const member = message.guild.members.cache.get(user.id);
        if (!member) return;

        const actionTaken = config.Action.toLowerCase();

        if (actionTaken === 'kick') {
          member.kick('AutoMod: Melebihi batas peringatan').catch(() => {});
        } else if (actionTaken === 'ban') {
          member.ban({ reason: 'AutoMod: Melebihi batas peringatan' }).catch(() => {});
        } else if (actionTaken === 'timeout') {
          member.timeout(60 * 60 * 1000, 'AutoMod: Melebihi batas peringatan').catch(() => {}); // 1 jam
        }
      }
    }
  }
};