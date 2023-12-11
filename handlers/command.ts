import { Client } from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';
import { SlashCommand } from '../types';
import { color } from '../utils/functions';

module.exports = async (client: Client) => {
	const slashCommandsDir = join(__dirname, '..', 'commands');
	const slashCommandFiles = readdirSync(slashCommandsDir);

	for (const file of slashCommandFiles) {
		const filePath = join(slashCommandsDir, file);
		const command: SlashCommand = (await import(filePath)).default;

		client.slashCommands.set(command.command.name, command);
		console.log(
			color('text', `Successfully loaded slash command ${color('variable', command.command.name)}`)
		);
	}
};
