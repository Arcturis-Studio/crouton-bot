const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("translate")
    .setDescription("Translates the message to ewokese..."),
  async execute(interaction) {
    await interaction.reply("Balls");
  },
};
