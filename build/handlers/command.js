"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import { REST } from "@discordjs/rest";
const fs_1 = require("fs");
const path_1 = require("path");
module.exports = (client) => {
    const slashCommands = [];
    let slashCommandsDir = (0, path_1.join)(__dirname, "..", "slashCommands");
    (0, fs_1.readdirSync)(slashCommandsDir).forEach((file) => {
        if (!file.endsWith(".js"))
            return;
        let command = require(`${slashCommandsDir}/${file}`).default;
        slashCommands.push(command.command);
        client.slashCommands.set(command.command.name, command);
    });
    //   const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN);
    //   rest
    //     .put(Routes.applicationCommands(process.env.CLIENT_ID), {
    //       body: slashCommands.map((command) => command.toJSON()),
    //     })
    //     .then((data: any) => {
    //       console.log(
    //         color(
    //           "text",
    //           `🔥 Successfully loaded ${color(
    //             "variable",
    //             data.length
    //           )} slash command(s)`
    //         )
    //       );
    //     })
    //     .catch((e) => {
    //       console.log(e);
    //     });
};
