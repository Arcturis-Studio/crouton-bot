import { Client, SlashCommandBuilder } from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';
import { SlashCommand } from '../types';

module.exports = (client: Client) => {
	const slashCommands: SlashCommandBuilder[] = [];

	let slashCommandsDir = join(__dirname, '..', 'commands');

	readdirSync(slashCommandsDir).forEach((file) => {
		if (!file.endsWith('.js')) return;
		let command: SlashCommand = require(`${slashCommandsDir}/${file}`).default;
		slashCommands.push(command.command);
		client.slashCommands.set(command.command.name, command);
	});
};
