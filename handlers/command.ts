import { Client, Routes, SlashCommandBuilder } from 'discord.js';
import { REST } from '@discordjs/rest';
import { readdirSync } from 'fs';
import { join } from 'path';
import { color } from '../utils/functions';
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
