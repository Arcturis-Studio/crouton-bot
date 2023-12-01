import { describe, expect, it, vi } from 'vitest';
import { getRandomPun } from '../../commands/pun';
import { Database } from '../../supabase/database';
import { supabase } from '../../supabase';
import command from '../../commands/pun';
import { ChatInputCommandInteraction } from 'discord.js';
import { generalErrorMessage, timeoutDelete } from '../../utils/functions';

vi.mock('../../supabase');
vi.mock('../../utils/functions', () => {
	return {
		generalErrorMessage: vi.fn(),
		timeoutDelete: vi.fn()
	};
});

describe('getRandomPun', () => {
	it('returns a random pun from the given array', () => {
		const puns: Array<Database['public']['Tables']['puns']['Row']> = [
			{
				created_at: Date().toString(),
				guild_id: 1,
				id: 1,
				pun: "Why don't skeletons fight each other? They don't have the guts."
			},
			{
				created_at: Date().toString(),
				guild_id: 1,
				id: 2,
				pun: "I used to be a baker, but I couldn't make enough dough."
			},
			{
				created_at: Date().toString(),
				guild_id: 1,
				id: 3,
				pun: "Why don't scientists trust atoms? Because they make up everything!"
			}
		];

		const randomPun = getRandomPun(puns);

		expect(puns).toContain(randomPun);
	});

	it('returns undefined if the given array is empty', () => {
		const puns: Array<Database['public']['Tables']['puns']['Row']> = [];

		const randomPun = getRandomPun(puns);

		expect(randomPun).toBeUndefined();
	});

	it('returns the only pun if the array contains only one pun', () => {
		const puns = [
			{
				created_at: Date().toString(),
				guild_id: 1,
				id: 1,
				pun: "Why don't skeletons fight each other? They don't have the guts."
			}
		];

		const randomPun = getRandomPun(puns);

		expect(randomPun).toEqual(puns[0]);
	});
});

describe('command.execute', () => {
	const interaction = {
		deferReply: vi.fn(),
		editReply: vi.fn(),
		guildId: '123'
	} as unknown as ChatInputCommandInteraction;

	it('should defer the reply', async () => {
		supabase.from = vi.fn().mockReturnValue({
			select: vi.fn().mockReturnValue({
				or: vi.fn().mockReturnValue({
					error: 'error'
				})
			})
		});

		await command.execute(interaction);

		expect(interaction.deferReply).toHaveBeenCalled();
	});

	it('should fetch puns from supabase', async () => {
		supabase.from = vi.fn().mockReturnValue({
			select: vi.fn().mockReturnValue({
				or: vi.fn().mockReturnValue({
					error: 'error'
				})
			})
		});

		await command.execute(interaction);

		expect(supabase.from).toHaveBeenCalledWith('puns');
		expect(supabase.from('puns').select).toHaveBeenCalled();
		expect(supabase.from('puns').select().or).toHaveBeenCalledWith(
			'guild_id.is.null,guild_id.eq.123'
		);
	});

	it('should handle error when fetching puns', async () => {
		supabase.from = vi.fn().mockReturnValue({
			select: vi.fn().mockReturnValue({
				or: vi.fn().mockReturnValue({
					error: 'error'
				})
			})
		});

		console.error = vi.fn();

		await command.execute(interaction);

		expect(console.error).toHaveBeenCalledWith('error');
		expect(generalErrorMessage).toHaveBeenCalledWith(interaction);
	});

	it('should handle null data', async () => {
		supabase.from = vi.fn().mockReturnValue({
			select: vi.fn().mockReturnValue({
				or: vi.fn().mockReturnValue({
					data: null
				})
			})
		});

		await command.execute(interaction);

		expect(interaction.editReply).toHaveBeenCalledWith('Uh oh... There was nothing in the oven!');
		expect(timeoutDelete).toHaveBeenCalledWith(interaction);
	});

	it('should reply with random pun', async () => {
		const pun = 'Why did the scarecrow win an award? Because he was outstanding in his field!';

		supabase.from = vi.fn().mockReturnValue({
			select: vi.fn().mockReturnValue({
				or: vi.fn().mockReturnValue({
					data: [{ pun }]
				})
			})
		});

		await command.execute(interaction);

		expect(interaction.editReply).toHaveBeenCalledWith(pun);
	});

	it('should reply with fallback message when no pun available', async () => {
		supabase.from = vi.fn().mockReturnValue({
			select: vi.fn().mockReturnValue({
				or: vi.fn().mockReturnValue({
					data: []
				})
			})
		});

		await command.execute(interaction);

		expect(interaction.editReply).toHaveBeenCalledWith(
			"We regret to inform you that our bread puns have all been gobbled up. Please try again when we've baked some fresh ones."
		);
	});
});
