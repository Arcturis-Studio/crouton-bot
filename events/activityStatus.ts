import { Client, ActivityType } from 'discord.js';
import { BotEvent } from '../types';
import { supabase } from '../supabase';
import { Database } from '../supabase/database';

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

class Activities {
	public activities: Array<Database['public']['Tables']['presence']['Row']>;
	public client: Client;
	constructor(client: Client) {
		this.activities = [];
		this.client = client;
	}

	public async init() {
		const { data, error } = await supabase.from('presence').select();

		if (error) {
			console.log(error);
			return;
		}

		if (!data) {
			return;
		}

		this.activities = data;
		this.setActivity();
		this.listenToActivities();
	}

	public setActivity() {
		const randomActivity =
			this.activities[Math.floor(Math.random() * (this.activities.length - 1) + 1)];
		
		if (this.activities.length === 0) return;

		this.client.user?.setActivity(randomActivity.activity, {
			type: <Exclude<ActivityType, ActivityType.Custom>>(
				ActivityType[randomActivity.type as keyof typeof ActivityType]
			)
		});
	}

	private delete(data: { id: string }) {
		this.activities.splice(
			this.activities.findIndex((a) => a.id === data.id),
			1
		);
		this.setActivity();
	}

	private insert(data: Database['public']['Tables']['presence']['Row']) {
		this.activities.push(data);
	}

	private update(data: Database['public']['Tables']['presence']['Row']) {
		this.activities[this.activities.findIndex((a) => a.id === data.id)] = data;
		this.setActivity();
	}

	private listenToActivities() {
		supabase
			.channel('presence')
			.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'presence' }, (data) => {
				this.insert(<Database['public']['Tables']['presence']['Row']>data.new);
			})
			.on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'presence' }, (data) => {
				this.update(<Database['public']['Tables']['presence']['Row']>data.new);
			})
			.on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'presence' }, (data) => {
				this.delete(<{ id: string }>data.old);
			})
			.subscribe();
	}
}

export default event;
