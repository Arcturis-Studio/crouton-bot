"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const dotenv_1 = require("dotenv");
const discord_js_1 = require("discord.js");
const envFile = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : ".env";
(0, dotenv_1.config)({ path: (0, path_1.join)(__dirname, "..", "..", envFile) });
const client = new discord_js_1.Client({
    intents: [
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.MessageContent,
        discord_js_1.GatewayIntentBits.GuildMessageReactions,
        discord_js_1.GatewayIntentBits.GuildMessages,
    ],
    partials: [discord_js_1.Partials.Message, discord_js_1.Partials.Channel, discord_js_1.Partials.Reaction],
});
client.slashCommands = new discord_js_1.Collection();
client.cooldowns = new discord_js_1.Collection();
const handlersDir = (0, path_1.join)(__dirname, "./handlers");
(0, fs_1.readdirSync)(handlersDir).forEach((handler) => {
    require(`${handlersDir}/${handler}`)(client);
});
client.login(process.env.BOT_TOKEN);
