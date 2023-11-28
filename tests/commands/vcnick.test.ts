import { ChatInputCommandInteraction } from 'discord.js';
import { describe, expect, it, vi } from 'vitest';
import command from '../../commands/vcnick';

describe('vcnick', () => {
	const interaction = {
		deferReply: vi.fn(),
		editReply: vi.fn(),
		guildId: 1
	} as unknown as ChatInputCommandInteraction;

	it('should defer an ephemeral reply', async () => {
		const deferReplySpy = vi.spyOn(interaction, 'deferReply');

		await command.execute(interaction);

		expect(deferReplySpy).toHaveBeenCalledTimes(1);
	});

	it('should send an error message and a DM to the server owner if the bot has insufficient permissions', async () => {});

	it('should send an error message if the command invoker is the server owner', async () => {});

	it('should send an error message if the command invoker has a higher role than the bot', async () => {});

	it('should reset all configuration', async () => {});
});
