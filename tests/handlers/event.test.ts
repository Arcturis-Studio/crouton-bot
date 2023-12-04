import { describe, expect, it, vi } from 'vitest';
import * as eventHandler from '../../handlers/event';
import { Client } from 'discord.js';
import { BotEvent } from '../../types';
import { color } from '../../utils/functions';

vi.mock('discord.js', () => ({
	Client: vi.fn().mockImplementation(() => ({
		once: vi.fn(),
		on: vi.fn()
	}))
}));

vi.mock('fs', () => ({
	readdirSync: vi.fn().mockReturnValue(['ready.ts'])
}));

describe('loadEvents', async () => {
	const mockClient = new Client({ intents: [], partials: [] });

	it('should load events that are set to execute once', async () => {
		vi.doMock('../../events/ready.ts', () => ({
			default: {
				name: 'mockEvent',
				once: true,
				execute: vi.fn()
			} as BotEvent
		}));

		/* @ts-expect-error */
		await eventHandler.default(mockClient);

		expect(mockClient.once).toHaveBeenCalledWith('mockEvent', expect.any(Function));
	});

	it('should load events that are set to execute multiple times', async () => {
		vi.doMock('../../events/ready.ts', () => ({
			default: {
				name: 'mockEvent',
				once: false,
				execute: vi.fn()
			} as BotEvent
		}));

		/* @ts-expect-error */
		await eventHandler.default(mockClient);

		expect(mockClient.on).toHaveBeenCalledWith('mockEvent', expect.any(Function));
	});

	it('should log a success message for each loaded event', async () => {
		vi.doMock('../../events/ready.ts', () => ({
			default: {
				name: 'mockEvent',
				once: true,
				execute: vi.fn()
			} as BotEvent
		}));

		const consoleSpy = vi.spyOn(console, 'log');

		/* @ts-expect-error */
		await eventHandler.default(mockClient);

		expect(consoleSpy).toHaveBeenCalledWith(
			color('text', `Successfully loaded event ${color('variable', 'mockEvent')}`)
		);
	});
});
