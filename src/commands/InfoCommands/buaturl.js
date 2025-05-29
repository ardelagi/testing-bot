const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('link')
    .setDescription('Konversi link YouTube ke beberapa opsi download MP3')
    .addStringOption(option =>
      option.setName('url')
        .setDescription('Masukkan link YouTube')
        .setRequired(true)),

  async execute(interaction) {
    const url = interaction.options.getString('url');

    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/);
    if (!match) {
      return interaction.reply({ content: 'Link YouTube tidak valid.', ephemeral: true });
    }

    const videoId = match[1];

    const embed = new EmbedBuilder()
      .setColor(0x1DB954)
      .setTitle('Konversi Selesai!')
      .setDescription(`Berikut beberapa link download MP3 untuk:\n[YouTube Video](https://youtu.be/${videoId})`)
      .addFields([
        { name: 'Top4Top (Lama)', value: `https://b.top4top.io/m_${videoId}.mp3` },
        { name: 'Top4Top (Baru)', value: `http://i.top4top.io/m_${videoId}.mp3` },
        { name: 'Y2Mate', value: `https://y2mate.tools/download/${videoId}` },
        { name: 'YT1s', value: `https://yt1s.com/en?q=https://youtu.be/${videoId}` },
        { name: 'Loader.to', value: `https://loader.to/en16/youtube-mp3/${videoId}` },
        { name: 'SaveMP3', value: `https://savemp3.app/youtube-to-mp3/${videoId}` }
      ])
      .setFooter({ text: 'Gunakan link sesuai yang paling cepat' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};