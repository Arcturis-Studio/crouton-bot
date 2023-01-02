import { SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../types";
import { puns } from "../data/puns";

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("pun")
    .setDescription("Says a random pun"),
  execute: (interaction) => {
    interaction.reply(getRandomPun(puns));
  },
  cooldown: 10,
};

function getRandomPun(puns: string[]): string {
  const ranNum = Math.round(Math.random() * (puns.length - 0) + 0);

  return puns[ranNum];
}

export default command;
