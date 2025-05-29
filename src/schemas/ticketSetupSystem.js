const { Schema, model } = require("mongoose");

const ticketSetupSchema = new Schema({
  GuildID: { type: String, required: true },
  Channel: { type: String, required: true },
  Category: { type: String, required: true },
  Transcripts: { type: String, required: true },
  Logschannel: { type: String, required: true },
  Handlers: { type: String, required: true },
  Description: { type: String, required: true },
  Title: { type: String, required: true },
  Color: { type: String, default: "#2f3136" },
  Options: [
    {
      label: { type: String, required: true },
      emoji: { type: String, required: true }
    }
  ]
});

module.exports = model("TicketSetup", ticketSetupSchema);