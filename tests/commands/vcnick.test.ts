import { ChatInputCommandInteraction } from 'discord.js';
import { describe, expect, it, vi } from 'vitest';
import command from '../../commands/vcnick';
import { set, reset } from '../../commands/vcnick';
import { generalErrorMessage, timeoutDelete } from '../../utils/functions';
import { supabase } from '../../supabase';

vi.mock('../../supabase');
vi.mock('../../utils/functions', () => {
	return {
		generalErrorMessage: vi.fn(),
		timeoutDelete: vi.fn()
	};
});

describe('command.execute', () => {
	const interaction = {
		deferReply: vi.fn(),
		editReply: vi.fn(),
		guildId: 1
	} as unknown as ChatInputCommandInteraction;
	it('should defer an ephemeral reply', async () => {
		await command.execute(interaction);

		expect(interaction.deferReply).toHaveBeenCalledTimes(1);
	});
	it('should send an error message and a DM to the server owner if the bot has insufficient permissions', async () => {});
	it('should send an error message if the command invoker is the server owner', async () => {});
	it('should send an error message if the command invoker has a higher role than the bot', async () => {});
	it('should reset all configurations', async () => {});
});

describe('set', async () => {
	const interaction = {
		options: {
			getString: vi.fn().mockReturnValueOnce(null).mockReturnValue('nickname'),
			getChannel: vi.fn().mockReturnValueOnce(null).mockReturnValue({ name: 'channel' })
		},
		guild: {
			members: {
				fetch: vi
					.fn()
					.mockReturnValueOnce(undefined)
					.mockReturnValue({
						id: '1',
						guild: {
							id: '1'
						},
						displayName: 'oldNickname'
					})
			}
		},
		user: {
			id: '1'
		},
		editReply: vi.fn()
	} as unknown as ChatInputCommandInteraction;

	it('should send error message if the nickname or channel arguments are missing', async () => {
		await set(interaction);

		expect(interaction.editReply).toHaveBeenCalledWith(
			"I'm missing some information. Please provide both a nickname and a channel name."
		);
	});

	it('should send error message if member fetch fails', async () => {
		await set(interaction);

		expect(generalErrorMessage).toHaveBeenCalled();
	});

	it('should send error message if upsert fails', async () => {
		supabase.from = vi.fn().mockReturnValue({
			upsert: vi.fn().mockReturnValue({ error: 'error' })
		});

		console.error = vi.fn();

		await set(interaction);

		expect(generalErrorMessage).toHaveBeenCalled();
		expect(console.error).toHaveBeenCalledWith('error');
	});

	it('should send success message and call timeoutDelete', async () => {
		supabase.from = vi.fn().mockReturnValue({
			upsert: vi.fn().mockReturnValue({ data: 'data' })
		});

		await set(interaction);

		expect(interaction.editReply).toHaveBeenCalledWith(
			`Awesome nickname! Your nickname will be automatically changed to **nickname** when you join **channel**! Your name will be changed back to **oldNickname** when you leave.`
		);
		expect(timeoutDelete).toHaveBeenCalled();
	});
});

describe('reset', () => {
	const interaction = {
		options: {
			getBoolean: vi.fn().mockReturnValue(true)
		},
		guild: {
			channels: {
				fetch: vi.fn().mockReturnValue(null)
			}
		},
		guildId: '1',
		user: { id: '1' },
		editReply: vi.fn()
	} as unknown as ChatInputCommandInteraction;

	describe('all', () => {
		it('should delete all nicknames if `all` option is true', async () => {
			supabase.from = vi.fn().mockReturnValue({
				delete: vi.fn().mockReturnValue({
					eq: vi.fn().mockReturnValue({
						eq: vi.fn().mockReturnValue({
							error: null
						})
					})
				})
			});

			await reset(interaction);

			expect(interaction.options.getBoolean).toHaveBeenCalledWith('all');
			expect(supabase.from).toHaveBeenCalledWith('nicknames');
			expect(supabase.from('nicknames').delete).toHaveBeenCalled();
			expect(supabase.from('nicknames').delete().eq).toHaveBeenCalledWith('guild_id', '1');
			expect(supabase.from('nicknames').delete().eq('guild_id', 'guildId').eq).toHaveBeenCalledWith(
				'user_id',
				'1'
			);
			expect(interaction.editReply).toHaveBeenCalledWith(
				'You got it! All of your orders are out of the oven!'
			);
		});

		it('should handle error when deleting all nicknames', async () => {
			supabase.from = vi.fn().mockReturnValue({
				delete: vi.fn().mockReturnValue({
					eq: vi.fn().mockReturnValue({
						eq: vi.fn().mockReturnValue({
							error: 'error'
						})
					})
				})
			});

			console.error = vi.fn();

			await reset(interaction);

			expect(console.error).toHaveBeenCalledWith('error');
			expect(generalErrorMessage).toHaveBeenCalled();
		});
	});

	it('should handle error when selecting nicknames', async () => {
		interaction.options.getBoolean = vi.fn().mockReturnValue(false);

		supabase.from = vi.fn().mockReturnValue({
			select: vi.fn().mockReturnValue({
				eq: vi.fn().mockReturnValue({
					eq: vi.fn().mockReturnValue({
						error: 'error'
					})
				})
			})
		});

		console.error = vi.fn();

		await reset(interaction);

		expect(console.error).toHaveBeenCalledWith('error');
		expect(generalErrorMessage).toHaveBeenCalled();
	});

	it('should handle case when there are no nicknames', async () => {
		interaction.options.getBoolean = vi.fn().mockReturnValue(false);

		supabase.from = vi.fn().mockReturnValue({
			select: vi.fn().mockReturnValue({
				eq: vi.fn().mockReturnValue({
					eq: vi.fn().mockReturnValue({
						error: null,
						data: null
					})
				})
			})
		});

		await reset(interaction);

		expect(interaction.editReply).toHaveBeenCalledWith(
			'There was not anything in the bakery. You are good to go!'
		);
	});

	it('should handle error when fetching channels', async () => {
		interaction.options.getBoolean = vi.fn().mockReturnValue(false);

		supabase.from = vi.fn().mockReturnValue({
			select: vi.fn().mockReturnValue({
				eq: vi.fn().mockReturnValue({
					eq: vi.fn().mockReturnValue({
						error: null,
						data: 'data'
					})
				})
			})
		});

		console.error = vi.fn();

		await reset(interaction);

		expect(generalErrorMessage).toHaveBeenCalled();
	});

	it('should handle case when there are no valid channels', async () => {
		if (!interaction.guild) return;

		interaction.guild.channels.fetch = vi.fn().mockReturnValue([]);
		interaction.options.getBoolean = vi.fn().mockReturnValue(false);

		supabase.from = vi.fn().mockReturnValue({
			select: vi.fn().mockReturnValue({
				eq: vi.fn().mockReturnValue({
					eq: vi.fn().mockReturnValue({
						error: null,
						data: 'data'
					})
				})
			})
		});

		await reset(interaction);

		expect(interaction.guild.channels.fetch).toHaveBeenCalled();
		expect(generalErrorMessage).toHaveBeenCalled();
	});

});
