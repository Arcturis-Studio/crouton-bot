import { Client } from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';
import { color } from '../utils/functions';
import { BotEvent } from '../types';

module.exports = async (client: Client) => {
	const eventsDir = join(__dirname, '../events');
	const eventFiles = readdirSync(eventsDir);

	for (const file of eventFiles) {
		const filePath = join(eventsDir, file);
		const event: BotEvent = (await import(filePath)).default;

		if (event.once) {
			client.once(event.name, (...args) => event.execute(...args));
		} else {
			client.on(event.name, (...args) => event.execute(...args));
		}
		console.log(color('text', `Successfully loaded event ${color('variable', event.name)}`));
	}
};
