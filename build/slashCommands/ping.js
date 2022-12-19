"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const command = {
    command: new discord_js_1.SlashCommandBuilder()
        .setName("ping")
        .setDescription("Show's the bot's ping"),
    execute: (interaction) => {
        interaction.reply({
            embeds: [
                new discord_js_1.EmbedBuilder()
                    .setAuthor({ name: "MRC License" })
                    .setDescription(`🏓 Pong! \n 📡 Ping: ${interaction.client.ws.ping}`),
            ],
        });
    },
    cooldown: 10,
};
exports.default = command;
