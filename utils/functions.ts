import chalk from 'chalk';
import {
	ChatInputCommandInteraction,
	GuildMember,
	PermissionFlagsBits,
	PermissionResolvable,
	TextChannel
} from 'discord.js';
import { EmojiLib } from '../types';

const emojiLib = require('emojilib');
const emojiData: EmojiLib = require('unicode-emoji-json');

type ColorType = 'text' | 'variable' | 'error';

const themeColors = {
	text: '#ff8e4d',
	variable: '#ff624d',
	error: '#f5426c'
};

export const getThemeColor = (color: ColorType) => Number(`0x${themeColors[color].substring(1)}`);

export const color = (color: ColorType, message: any) => {
	return chalk.hex(themeColors[color])(message);
};

export const checkPermissions = (member: GuildMember, permissions: Array<PermissionResolvable>) => {
	let neededPermissions: PermissionResolvable[] = [];
	permissions.forEach((permission) => {
		if (!member.permissions.has(permission)) neededPermissions.push(permission);
	});
	if (neededPermissions.length === 0) return null;
	return neededPermissions.map((p) => {
		if (typeof p === 'string') return p.split(/(?=[A-Z])/).join(' ');
		else
			return Object.keys(PermissionFlagsBits)
				.find((k) => Object(PermissionFlagsBits)[k] === p)
				?.split(/(?=[A-Z])/)
				.join(' ');
	});
};

export async function timeoutDelete(interaction: ChatInputCommandInteraction) {
	setTimeout(async () => {
		await interaction.deleteReply();
	}, 30000);
}

export async function generalErrorMessage(interaction: ChatInputCommandInteraction) {
	await interaction.editReply(
		'Something went wrong in the bakery. Please try sending your order again.'
	);
	await timeoutDelete(interaction);
}

export const sendTimedMessage = async (message: string, channel: TextChannel, duration: number) => {
	const sentMessage = await channel.send(message);
	setTimeout(async () => {
		await sentMessage.delete();
	}, duration);
};

for (const emoji in emojiData) {
	emojiData[emoji]['keywords'] = emojiLib[emoji] ? emojiLib[emoji] : [];
}

export const getUnicodeByEmojiName = (emojiName: string) => {
	for (const emoji in emojiData) {
		if (
			emojiData[emoji].keywords.find(
				(keyword) => keyword.toLowerCase() == emojiName.toLowerCase()
			) == emojiName.toLowerCase()
		)
			return emoji;
	}
};
