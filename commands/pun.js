const { SlashCommandBuilder } = require("discord.js");
const puns = require("../puns/bakery.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pun")
    .setDescription("Says a random pun"),
  async execute(interaction) {
    await interaction.reply(getRandomPun(puns));
  },
};

function getRandomPun(puns) {
  const ranNum = Math.round(Math.random() * (puns.length - 0) + 0);

  return puns[ranNum];
}
