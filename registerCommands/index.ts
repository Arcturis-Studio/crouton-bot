import { Routes, SlashCommandBuilder } from 'discord.js';
import { REST } from '@discordjs/rest';
import { readdirSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';

async function main() {
	const envFile = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env';
	config({ path: join(__dirname, '..', '..', '..', envFile) });

	const slashCommands: SlashCommandBuilder[] = [];

	let slashCommandsDir = [
		join(__dirname, '..', '..', 'croutonbot', 'build', 'commands'),
		join(__dirname, '..', '..', 'evobot', 'dist', 'commands')
	];

	for (const dir in slashCommandsDir) {
		readdirSync(slashCommandsDir[dir]).forEach((file) => {
			if (!file.endsWith('.js')) return;
			const command = require(`${slashCommandsDir[dir]}/${file}`).default;

			if (command.command) {
				slashCommands.push(command.command);
			}

			if (command.data) {
				slashCommands.push(command.data);
			}
		});
	}

	const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

	const response: any = await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
		body: slashCommands.map((command) => command.toJSON())
	});

	console.log(`Successfully loaded ${response.length} slash command(s)`);
}

main().then(() => {
	process.exit(0);
});
