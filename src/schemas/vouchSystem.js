const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
    {
        Guild: { 
            type: String, 
            required: true, 
            unique: true 
        },
        Channel: {
            type: String, 
            required: true,
        },
        VouchNo: {
            type: Number, 
            default: 0, // Menyimpan jumlah Vouch yang telah digunakan
        },
        TotalRating: {
            type: Number, 
            default: 0, // Menyimpan total rating yang diberikan
        },
        RatingCount: {
            type: Number, 
            default: 0, // Menyimpan jumlah pemberi rating
        },
        AverageRating: {
            type: Number, 
            default: 0, // Menyimpan rating rata-rata
        }
    },
    {
        timestamps: true // Menyimpan waktu pembuatan dan update
    }
);

module.exports = mongoose.model("Rating", ratingSchema);