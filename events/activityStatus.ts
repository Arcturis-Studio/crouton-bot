import { Client } from 'discord.js';
import { BotEvent } from '../types';
import { Activities } from '../structs/Activities';

const event: BotEvent = {
	name: 'ready',
	once: true,
	execute: async (client: Client) => {
		const activities = new Activities(client);
		await activities.init();
		setInterval(() => {
			activities.setActivity();
		}, 3600000);
	}
};

export default event;
