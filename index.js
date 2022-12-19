const fs = require("fs");
const path = require("node:path");
const {
  Client,
  Collection,
  GatewayIntentBits,
  Partials,
} = require("discord.js");
const envFile = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : ".env";
require("dotenv").config({ path: path.join(__dirname, "..", envFile) });

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessages,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

const config = require(path.join(__dirname, "config.json"));
const ewokese = require(path.join(__dirname, "ewokese.json"));

client.commands = new Collection();
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

commandFiles.forEach((file) => {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  client.commands.set(command.data.name, command);
});

const eventsPath = path.join(__dirname, "events");
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) =>
      event.execute(...args, client, config, ewokese)
    );
  } else {
    client.on(event.name, (...args) =>
      event.execute(...args, client, config, ewokese)
    );
  }
}

client.login(process.env.BOT_TOKEN);
