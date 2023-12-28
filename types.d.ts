import {
	SlashCommandBuilder,
	ChatInputCommandInteraction,
	Collection,
	Message,
	AutocompleteInteraction,
	Events,
	messageLink,
	ReplyOptions
} from 'discord.js';

export interface SlashCommand {
	command: SlashCommandBuilder | any;
	execute: (interaction: ChatInputCommandInteraction) => void;
	autocomplete?: (interaction: AutocompleteInteraction) => void;
	cooldown?: number; // in seconds
}

interface GuildOptions {
	prefix: string;
}

export type GuildOption = keyof GuildOptions;

export interface BotEvent {
	name: string;
	once?: boolean | false;
	execute: (...args) => void;
}

export type Config = GuildConfig[];

interface GuildConfig {
	server: string;
	events: GuildEvent[];
}

interface GuildEvent {
	type: string | Events;
	conditions: GuildEventCondition[];
}

interface GuildEventCondition {
	name: string;
	requiredAuthor: { username: string | null };
	trigger: { keywords: string[] };
	action: Action;
}

interface Action {
	type: 'reply' | 'react' | string;
	value: string;
}

interface EmojiLib {
	[key: string]: EmojiData;
}

interface EmojiData {
	name: string;
	keywords: string[];
	slug: string;
	group: string;
	emoji_version: string;
	unicode_verison: string;
	skin_tone_support: boolean;
}

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			BOT_TOKEN: string;
			CLIENT_ID: string;
			PUBLIC_SUPABASE_URL: string;
			PUBLIC_SUPABASE_ANON_KEY: string;
			SUPABASE_SERVICE_ROLE_KEY: string;
			DEV_GUILD_ID: string;
		}
	}
}

declare module 'discord.js' {
	export interface Client {
		slashCommands: Collection<string, SlashCommand>;
		commands: Collection<string, Command>;
		cooldowns: Collection<string, number>;
	}
}
