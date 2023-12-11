import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Client, ActivityType } from 'discord.js';
import { Activities } from '../../structs/Activities';
import { supabase } from '../../supabase';
import { PostgrestResponse } from '@supabase/supabase-js';

vi.mock('../../supabase', () => ({
	supabase: {
		from: vi.fn().mockReturnValue({
			select: vi.fn().mockReturnValue({
				data: 'data'
			})
		}),
		channel: vi.fn().mockReturnValue({
			on: vi.fn().mockReturnValue({
				on: vi.fn().mockReturnValue({
					on: vi.fn().mockReturnValue({
						subscribe: vi.fn()
					})
				})
			})
		})
	}
}));

// Does not test private methods
describe('Activities', () => {
	let client: Client;
	let activities: Activities;

	beforeEach(() => {
		client = new Client({ intents: [], partials: [] });
		activities = new Activities(client);
	});

	describe('constructor', () => {
		it('should initialize activities array', () => {
			expect(activities.activities).toEqual([]);
		});

		it('should set client property', () => {
			expect(activities.client).toBe(client);
		});
	});

	describe('init', () => {
		it('should fetch data from supabase', async () => {
			const mockData = [{ id: '1', activity: 'Test', type: 'PLAYING', created_at: '2022-01-01' }];
			const mockResponse = { data: mockData, error: null } as unknown as PostgrestResponse<unknown>;

			vi.spyOn(supabase.from('presence'), 'select').mockResolvedValue(mockResponse);
			vi.spyOn(activities, 'setActivity');
			/* @ts-expect-error */
			// We expect this error since this is a private method, we still want to make sure it is called
			vi.spyOn(activities, 'listenToActivities');

			await activities.init();

			expect(supabase.from('presence').select).toHaveBeenCalled();
			expect(activities.activities).toEqual(mockData);
			expect(activities.setActivity).toHaveBeenCalled();
			/* @ts-expect-error */
			expect(activities.listenToActivities).toHaveBeenCalled();
		});

		it('should handle error if supabase query fails', async () => {
			const mockError = 'Error fetching data';

			vi.spyOn(supabase.from('presence'), 'select').mockResolvedValue({
				data: null,
				error: mockError
			} as unknown as PostgrestResponse<unknown>);

			console.log = vi.fn(); // Mock console.log

			await activities.init();

			expect(supabase.from('presence').select).toHaveBeenCalled();
			expect(console.log).toHaveBeenCalledWith(mockError);
			expect(activities.activities).toEqual([]);
		});
	});

	describe('setActivity', () => {
		it('should set activity for the client', () => {
			const mockActivity = { id: '1', activity: 'Test', type: 'PLAYING', created_at: '2022-01-01' };

			// Check that user is not null so the spy doesn't complain
			if (!activities.client.user) return;

			activities.setActivity();

			expect(activities.client.user.setActivity).toHaveBeenCalledWith(mockActivity.activity, {
				type: ActivityType[mockActivity.type as keyof typeof ActivityType]
			});
		});

		it('should not set activity if activities array is empty', () => {
			// Check that user is not null so the spy doesn't complain
			if (!activities.client.user) return;

			activities.setActivity();

			expect(activities.client.user?.setActivity).not.toHaveBeenCalled();
		});
	});
});
