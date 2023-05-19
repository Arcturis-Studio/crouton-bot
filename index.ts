import { readdirSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';
import { SlashCommand } from './types';
import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';

const envFile = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env';
config({ path: join(__dirname, '..', '..', envFile) });

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.GuildMembers
	],
	partials: [
		Partials.Message,
		Partials.Channel,
		Partials.Reaction,
		Partials.GuildMember,
		Partials.User
	]
});

client.slashCommands = new Collection<string, SlashCommand>();
client.cooldowns = new Collection<string, number>();

const handlersDir = join(__dirname, './handlers');
readdirSync(handlersDir).forEach((handler) => {
	require(`${handlersDir}/${handler}`)(client);
});

client.login(process.env.BOT_TOKEN);
