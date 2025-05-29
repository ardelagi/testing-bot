const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js");
const { createCanvas, loadImage } = require("canvas");
const axios = require("axios");
const VouchSystem = require("../../schemas/vouchSystem");

async function fetchValidAvatar(url) {
  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    const type = response.headers["content-type"];
    if (!["image/png", "image/jpeg"].includes(type))
      throw new Error(`Unsupported type: ${type}`);
    return await loadImage(response.data);
  } catch {
    return await loadImage("./default-avatar.png");
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("vouch")
    .setDescription("Provide vouch for a transaction")
    .addUserOption((option) =>
      option.setName("seller").setDescription("The seller you want to rate").setRequired(true)
    )
    .addUserOption((option) =>
      option.setName("buyer").setDescription("The buyer you want to rate").setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("rep")
        .setDescription("The rating you want to give")
        .setRequired(true)
        .addChoices(
          { name: "⭐", value: "1" },
          { name: "⭐⭐", value: "2" },
          { name: "⭐⭐⭐", value: "3" },
          { name: "⭐⭐⭐⭐", value: "4" },
          { name: "⭐⭐⭐⭐⭐", value: "5" }
        )
    )
    .addStringOption((option) =>
      option.setName("comments").setDescription("Comments on the transaction").setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const { options, guild } = interaction;
    const seller = options.getUser("seller");
    const buyer = options.getUser("buyer");
    const rep = parseInt(options.getString("rep"));
    const comments = options.getString("comments");

    const vouchData = await VouchSystem.findOne({ Guild: guild.id });
    if (!vouchData?.Channel) {
      return interaction.editReply({
        content: "🚫 Rating channel belum diset. Gunakan `/setup-vouch` untuk mengatur channel.",
        ephemeral: true,
      });
    }

    const channel = guild.channels.cache.get(vouchData.Channel);
    if (!channel) {
      return interaction.editReply({
        content: "❌ Channel rating tidak ditemukan. Atur ulang dengan `/setup-vouch`.",
        ephemeral: true,
      });
    }

    const updatedData = await VouchSystem.findOneAndUpdate(
      { Guild: guild.id },
      {
        $inc: { VouchNo: 1, RatingCount: 1, TotalRating: rep },
        $set: { AverageRating: (vouchData.TotalRating + rep) / (vouchData.RatingCount + 1) }
      },
      { new: true }
    );

    const canvas = createCanvas(700, 350);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#1a1a26"; // Background yang lebih soft dan nyaman di mata
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Judul & bintang
    ctx.fillStyle = "#fff"; // Teks putih pekat
    ctx.font = "bold 32px sans-serif";
    ctx.fillText("New Vouch Submitted!", 50, 60);

    ctx.fillStyle = "#FFD700";
    ctx.font = "38px sans-serif";
    ctx.fillText("★".repeat(rep), 50, 100); // Bintang untuk rating

    // Komentar
    ctx.font = "italic 20px sans-serif";
    ctx.fillStyle = "#fff"; // Teks putih pekat
    const words = comments.split(" ");
    let line = "", y = 150;
    for (let word of words) {
      const testLine = line + word + " ";
      if (ctx.measureText(testLine).width > 600) {
        ctx.fillText(line, 50, y);
        line = word + " ";
        y += 28;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 50, y);

    // Info
    ctx.font = "18px sans-serif";
    ctx.fillStyle = "#fff"; // Teks putih pekat
    const infoY = y + 40;
    const avg = updatedData.AverageRating;
    const full = Math.floor(avg), half = avg % 1 >= 0.5 ? 1 : 0, empty = 5 - full - half;
    const avgStars = "★".repeat(full) + (half ? "★" : "") + "★".repeat(empty);

    ctx.fillText(`Vouch No: ${updatedData.VouchNo}`, 50, infoY);
    ctx.fillText(`By: ${interaction.user.tag}`, 50, infoY + 25);

    const localeDate = new Date().toLocaleString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'Asia/Jakarta'
    });
    ctx.fillText(`Date: ${localeDate}`, 50, infoY + 50);

    ctx.fillText(`Seller: ${seller.tag}`, 50, infoY + 75);
    ctx.fillText(`Buyer: ${buyer.tag}`, 50, infoY + 100);
    ctx.fillStyle = "#FFD700";
    ctx.fillText(avgStars, 50, infoY + 130);
    ctx.fillStyle = "#fff"; // Teks putih pekat
    ctx.fillText(`(${avg.toFixed(2)}/5)`, 50 + ctx.measureText(avgStars).width + 10, infoY + 130);

    // Avatar user
    try {
      const avatar = await fetchValidAvatar(interaction.user.displayAvatarURL({ extension: "png", size: 512 }));
      ctx.save();
      ctx.beginPath();
      ctx.arc(595, 100, 60, 0, Math.PI * 2); // Posisi avatar
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar, 560, 40, 120, 120);
      ctx.restore();

      // Border emas dan efek glow
      ctx.beginPath();
      ctx.arc(595, 100, 62, 0, Math.PI * 2); // Border sedikit lebih besar dari avatar
      ctx.strokeStyle = "#FFD700"; // Warna border emas
      ctx.lineWidth = 6; // Ketebalan border
      ctx.shadowColor = "rgba(255, 215, 0, 0.8)";
      ctx.shadowBlur = 15;
      ctx.stroke();
    } catch (err) {
      console.error("Avatar gagal dimuat:", err.message);
    }

    // Teks "Thanks for Vouch" di bawah avatar
    ctx.font = "bold 18px sans-serif";
    ctx.fillStyle = "#fff"; // Teks putih pekat
    ctx.fillText("Thanks for vouch!", 500, 185);

    const attachment = new AttachmentBuilder(canvas.toBuffer(), {
      name: `vouch-${updatedData.VouchNo}.png`,
    });

    await channel.send({ content: `New Vouch by <@${interaction.user.id}>`, files: [attachment] });

    return interaction.editReply({
      content: `Berhasil mengirim vouch ke ${channel}.`,
      ephemeral: true,
    });
  },
};