import { describe, expect, it, vi, beforeEach } from 'vitest';
import command from '../../commands/roll';
import { ActionRowBuilder, ChatInputCommandInteraction } from 'discord.js';
import { generalErrorMessage } from '../../utils/functions';

vi.mock('../../utils/functions', () => {
	return {
		generalErrorMessage: vi.fn()
	};
});

let interaction: ChatInputCommandInteraction;

beforeEach(() => {
	interaction = {
		deferReply: vi.fn(),
		editReply: vi.fn(),
		options: {
			getString: vi.fn().mockReturnValue('1d20')
		},
		user: {
			username: 'Mocked Username'
		}
	} as unknown as ChatInputCommandInteraction;
});

describe('roll', () => {
	it('should send an error message if the dice argument is null', async () => {
		interaction.options.getString = vi.fn().mockReturnValue(null);

		await command.execute(interaction);

		expect(generalErrorMessage).toHaveBeenCalled();
	});

	it('should send a message with a button', async () => {
		await command.execute(interaction);

		expect(interaction.editReply).toHaveBeenCalledWith(
			expect.objectContaining({
				components: expect.arrayContaining([expect.any(ActionRowBuilder)])
			})
		);
	});
});
