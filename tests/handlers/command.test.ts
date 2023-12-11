import { describe, expect, it, vi } from 'vitest';
import * as command from '../../handlers/command';
import { Client } from 'discord.js';
import { color } from '../../utils/functions';

vi.mock('discord.js', () => ({
	Client: vi.fn().mockImplementation(() => ({
		slashCommands: {
			set: vi.fn()
		}
	}))
}));

vi.mock('fs', () => ({
	readdirSync: vi.fn().mockReturnValue(['pun.ts'])
}));

describe('loadEvents', async () => {
	const mockClient = new Client({ intents: [], partials: [] });

	vi.doMock('../../commands/pun.ts', () => ({
		default: {
			command: {
				name: 'mockCommand'
			}
		}
	}));

	it('should load slash commands into the client', async () => {
		/* @ts-expect-error */
		await command.default(mockClient);

		expect(mockClient.slashCommands.set).toHaveBeenCalledWith('mockCommand', expect.any(Object));
	});

	it('should log a success message for each loaded command', async () => {
		const consoleSpy = vi.spyOn(console, 'log');

		/* @ts-expect-error */
		await command.default(mockClient);

		expect(consoleSpy).toHaveBeenCalledWith(
			color('text', `Successfully loaded slash command ${color('variable', 'mockCommand')}`)
		);
	});
});
