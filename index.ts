import { readdirSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';
import { SlashCommand } from './types';
import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';

process.stdin.resume();

const envFile = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env';
config({ path: join(__dirname, '..', envFile) });

//NOTE: We HAVE to import supabase after we load our .env file as it depends on secrets if a .env file is used.
// We could move .env loading into the supabase file, but I like it here.
import { supabase } from './supabase';

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
readdirSync(handlersDir).forEach(async (handlerFile) => {
	const handler = await import(`${handlersDir}/${handlerFile}`);
	await handler.default(client);
});

client.login(process.env.BOT_TOKEN);

process.on('SIGINT' || 'SIGTERM' || 'SIGKILL', (code) => {
	console.log(`\n${code} received... Closing open connections...`);
	supabase.removeAllChannels();
	client.destroy();
	process.exit(0);
});
