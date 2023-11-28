import { describe, expect, it } from 'vitest';
import { getRandomPun } from '../../commands/pun';
import { Database } from '../../supabase/database';

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
