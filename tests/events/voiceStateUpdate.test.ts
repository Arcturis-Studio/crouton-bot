import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '../../supabase';
import event from '../../events/voiceStateUpdate';
import { GuildMember, Guild, GuildMemberManager, VoiceState } from 'discord.js';

vi.mock('../../supabase');

let guild = {} as unknown as Guild;
let oldMember = {} as unknown as VoiceState;
let newMember = {} as unknown as VoiceState;

beforeEach(() => {
	supabase.from = vi.fn().mockReturnValue({
		select: vi.fn().mockReturnValue({
			eq: vi.fn().mockReturnValue({
				eq: vi.fn().mockReturnValue({
					data: [
						{
							voice_channel_id: 'channelId',
							new_nickname: 'New Nickname',
							old_nickname: 'Old Nickname'
						}
					],
					error: null
				})
			})
		})
	});

	guild = {
		name: 'Mocked Guild',
		ownerId: 'guildOwnerId',
		fetchOwner: vi.fn().mockResolvedValue({ id: 'guildOwnerId', send: vi.fn() }),
		members: {
			fetchMe: vi.fn().mockResolvedValue({
				roles: {
					highest: {
						position: 2
					}
				},
				permissions: {
					has: vi.fn().mockReturnValue(true)
				}
			})
		} as unknown as GuildMemberManager
	} as unknown as Guild;

	newMember = {
		id: 'memberId',
		channelId: 'channelId',
		guild: {
			id: 'guildId',
			ownerId: 'guildOwnerId',
			members: {
				fetch: vi.fn().mockResolvedValue({
					id: 'memberId',
					roles: {
						highest: {
							position: 1
						}
					},
					setNickname: vi.fn(),
					guild
				}),
				fetchMe: guild.members.fetchMe
			}
		}
	} as unknown as VoiceState;

	oldMember = {
		id: 'memberId',
		channelId: 'channelId',
		guild: {
			id: 'guildId',
			ownerId: 'guildOwnerId',
			members: {
				fetch: vi.fn().mockResolvedValue({
					id: 'memberId',
					roles: {
						highest: {
							position: 1
						}
					},
					setNickname: vi.fn(),
					guild
				}),
				fetchMe: guild.members.fetchMe
			}
		}
	} as unknown as VoiceState;
});

describe('voiceStateUpdate', () => {
	it('should not change nickname if the member is guild owner', async () => {
		newMember.guild.members.fetch = vi.fn().mockReturnValue({
			id: 'guildOwnerId',
			roles: {
				highest: {
					position: 1
				}
			},
			guild
		});

		await event.execute(oldMember, newMember);

		expect(guild.members.fetchMe).not.toHaveBeenCalled();
	});

	it('should not change nickname if the member has a higher role than Crouton', async () => {
		guild.members.fetchMe = vi.fn().mockResolvedValue({
			roles: {
				highest: {
					position: 0
				}
			}
		});

		await event.execute(oldMember, newMember);

		expect(guild.members.fetchMe).toHaveBeenCalled();
		expect(supabase.from('nicknames').select).not.toHaveBeenCalled();
	});

	it('should handle a select response error', async () => {
		const supabaseError = {
			code: 'PG Error'
		};

		supabase.from('nicknames').select().eq('', '').eq = vi
			.fn()
			.mockResolvedValue({ data: null, error: supabaseError });

		console.error = vi.fn();

		await event.execute(oldMember, newMember);

		expect(supabase.from('nicknames').select).toHaveBeenCalled();
		expect(console.error).toHaveBeenCalledWith(supabaseError);
	});

	it('should handle a no row response error', async () => {
		const supabaseError = {
			code: 'PGRST116'
		};

		supabase.from('nicknames').select().eq('', '').eq = vi
			.fn()
			.mockResolvedValue({ data: null, error: supabaseError });

		console.error = vi.fn();

		await event.execute(oldMember, newMember);

		expect(supabase.from('nicknames').select).toHaveBeenCalled();
		expect(console.error).not.toHaveBeenCalled();
	});

	it('should send a DM to the guild owner if Crouton is missing ManageNicknames permissions', async () => {
		newMember.guild.members.fetchMe = vi.fn().mockResolvedValue({
			roles: {
				highest: {
					position: 2
				}
			},
			permissions: {
				has: vi.fn().mockReturnValue(false)
			}
		});

		await event.execute(oldMember, newMember);

		expect(newMember.guild.members.fetchMe).toHaveBeenCalled();
		expect(guild.fetchOwner).toHaveBeenCalled();
		expect((await guild.fetchOwner()).send).toHaveBeenCalledWith(
			`I do not have permissions to manage nicknames in ${guild.name}! Please try inviting me again to refresh permissions.`
		);
	});

	it('should change to the new nickname if the member is in a recognized channel', async () => {
		await event.execute(oldMember, newMember);

		expect((await newMember.guild.members.fetch('')).setNickname).toHaveBeenCalledWith(
			'New Nickname'
		);
	});

	it('should change to the old nickname if the member is in an unrecognized channel', async () => {
		newMember.channelId = null;

		await event.execute(oldMember, newMember);

		expect((await newMember.guild.members.fetch('')).setNickname).toHaveBeenCalledWith(
			'Old Nickname'
		);
	});
});
