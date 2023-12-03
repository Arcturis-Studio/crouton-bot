import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
	timeoutDelete,
	generalErrorMessage,
	getUnicodeByEmojiName,
	color
} from '../../utils/functions';
import { ChatInputCommandInteraction } from 'discord.js';
import chalk from 'chalk';

beforeEach(() => {
	vi.useFakeTimers();
	vi.spyOn(global, 'setTimeout');
});

afterEach(() => {
	vi.useRealTimers();
});

describe('generalErrorMessage', () => {
	const interaction = {
		editReply: vi.fn(),
		deleteReply: vi.fn()
	} as unknown as ChatInputCommandInteraction;

	it('should call interaction.editReply with the correct message', async () => {
		await generalErrorMessage(interaction);

		expect(interaction.editReply).toHaveBeenCalledWith(
			'Something went wrong in the bakery. Please try sending your order again.'
		);
	});

	it('should call timeoutDelete after calling interaction.editReply', async () => {
		await generalErrorMessage(interaction);

		expect(interaction.editReply).toHaveBeenCalledTimes(1);
		// Directly checking is setTimeout is called instead of timeoutDelete
		// TODO: Mock timeoutDelete, may need to move functions into their own files?
		expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 30000);
	});
});

describe('timeoutDelete', () => {
	const interaction = {
		editReply: vi.fn(),
		deleteReply: vi.fn()
	} as unknown as ChatInputCommandInteraction;

	it('should call interaction.deleteReply after 30 seconds', async () => {
		await timeoutDelete(interaction);

		await vi.advanceTimersByTimeAsync(30000);

		expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 30000);
		expect(interaction.deleteReply).toHaveBeenCalledTimes(1);
	});
});

describe('getUnicodeByEmojiName', () => {
	it('should return the correct unicode for a given emoji name', () => {
		const unicode = getUnicodeByEmojiName('smile');
		expect(unicode).toBe('😀');
	});

	it('should return undefined if the emoji name does not exist', () => {
		const unicode = getUnicodeByEmojiName('nonexistent');
		expect(unicode).toBeUndefined();
	});

	it('should be case insensitive when searching for an emoji name', () => {
		const unicode = getUnicodeByEmojiName('SMILE');
		expect(unicode).toBe('😀');
	});
});

describe('color', () => {
	it('should return a colored message', () => {
		const result = color('text', 'Hello, World!');
		const expected = chalk.hex('#ff8e4d')('Hello, World!');

		expect(result).toEqual(expected);
	});
});
