import { describe, it, expect, vi } from 'vitest';
import { supabase } from '../../supabase';
import event from '../../events/guildMemberUpdate';

vi.mock('../../supabase', () => ({
	supabase: {
		from: vi.fn().mockReturnValue({
			select: vi.fn().mockReturnValue({
				eq: vi.fn().mockReturnValue({
					eq: vi.fn().mockReturnValue({
						data: 'data'
					})
				})
			}),
			update: vi.fn().mockReturnValue({
				eq: vi.fn().mockReturnValue({
					eq: vi.fn().mockReturnValue({
						data: 'data'
					})
				})
			})
		})
	}
}));

describe('guildMemberUpdate', () => {
	it('should not update nickname if oldMember is guild owner', async () => {
		const oldMember = {
			id: 'guildOwnerId',
			guild: {
				ownerId: 'guildOwnerId'
			}
		};
		const newMember = {
			id: 'newMemberId',
			guild: {
				id: 'guildId'
			}
		};

		await event.execute(oldMember, newMember);

		expect(supabase.from('nicknames').select).not.toHaveBeenCalled();
	});

	it('should handle a select response error', async () => {
		const oldMember = {
			id: 'oldMemberId',
			guild: {
				id: 'guildId'
			}
		};
		const newMember = {
			id: 'newMemberId',
			guild: {
				id: 'guildId'
			}
		};
		const supabaseError = {
			code: 'PG Error'
		};

		supabase.from('nicknames').select().eq('', '').eq = vi
			.fn()
			.mockResolvedValue({ data: null, error: supabaseError });

		console.error = vi.fn();

		await event.execute(oldMember, newMember);

		await expect(
			supabase
				.from('nicknames')
				.select()
				.eq('user_id', oldMember.id)
				.eq('guild_id', oldMember.guild.id)
		).resolves.toEqual({ data: null, error: supabaseError });

		expect(console.error).toHaveBeenCalledWith(supabaseError);
		expect(supabase.from('nicknames').update).not.toHaveBeenCalled();
	});

	it('should handle no row response error', async () => {
		const oldMember = {
			id: 'oldMemberId',
			guild: {
				id: 'guildId'
			}
		};
		const newMember = {
			id: 'newMemberId',
			guild: {
				id: 'guildId'
			}
		};
		const supabaseError = {
			code: 'PGRST116'
		};

		supabase.from('nicknames').select().eq('', '').eq = vi
			.fn()
			.mockResolvedValue({ data: null, error: supabaseError });

		console.error = vi.fn();

		await event.execute(oldMember, newMember);

		await expect(
			supabase
				.from('nicknames')
				.select()
				.eq('user_id', oldMember.id)
				.eq('guild_id', oldMember.guild.id)
		).resolves.toEqual({ data: null, error: supabaseError });

		expect(supabase.from('nicknames').update).not.toHaveBeenCalled();
		expect(console.error).not.toHaveBeenCalled();
	});

	it('should update nickname if currentChannel is undefined and oldNickname is not equal to newMember.displayName', async () => {
		const oldMember = {
			id: 'oldMemberId',
			guild: {
				id: 'guildId'
			}
		};
		const newMember = {
			id: 'newMemberId',
			guild: {
				id: 'guildId'
			},
			displayName: 'New Member'
		};

		supabase.from('nicknames').update({}).eq('', '').eq = vi
			.fn()
			.mockResolvedValue({ error: null });

		await event.execute(oldMember, newMember);

		expect(supabase.from('nicknames').update).toHaveBeenCalled();
		expect(console.error).not.toHaveBeenCalled();
	});

	it('should not update nickname if currentChannel is defined', async () => {
		const oldMember = {
			id: 'oldMemberId',
			guild: {
				id: 'guildId'
			},
			displayName: 'Old Member'
		};
		const newMember = {
			id: 'newMemberId',
			guild: {
				id: 'guildId'
			},
			voice: {
				channelId: 'channelId'
			},
			displayName: 'New Member'
		};

		supabase.from('nicknames').select().eq('', '').eq = vi.fn().mockResolvedValue({
			data: [{ old_nickname: oldMember.displayName, voice_channel_id: 'channelId' }],
			error: null
		});

		await event.execute(oldMember, newMember);

		expect(supabase.from('nicknames').select).toHaveBeenCalled();
		expect(supabase.from('nicknames').update).not.toHaveBeenCalled();
		expect(console.error).not.toHaveBeenCalled();
	});

	it('should handle an update response error', async () => {
		const oldMember = {
			id: 'oldMemberId',
			guild: {
				id: 'guildId'
			},
			displayName: 'Old Member'
		};
		const newMember = {
			id: 'newMemberId',
			guild: {
				id: 'guildId'
			},
			voice: {
				channelId: 'invalidChannelId'
			},
			displayName: 'New Member'
		};
		const supabaseError = {
			code: 'PG Error'
		};

		supabase.from('nicknames').update({}).eq('', '').eq = vi
			.fn()
			.mockResolvedValue({ error: supabaseError });

		console.error = vi.fn();

		await event.execute(oldMember, newMember);

		expect(supabase.from('nicknames').update).toHaveBeenCalled();
		expect(console.error).toHaveBeenCalledWith(supabaseError);
	});
});
