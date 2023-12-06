import { GuildMember } from 'discord.js';
import { BotEvent } from '../types';
import { supabase } from '../supabase';

const event: BotEvent = {
	name: 'guildMemberUpdate',
	execute: async (oldMember: GuildMember, newMember: GuildMember) => {
		// We can't change guild owners nicknames so no need to update
		if (oldMember.id === oldMember.guild.ownerId) return;

		// TODO: Check if the name changed before making a DB query

		const { data, error } = await supabase
			.from('nicknames')
			.select()
			.eq('user_id', oldMember.id)
			.eq('guild_id', oldMember.guild.id);

		// Ignore a no row response error
		if (error && error.code !== 'PGRST116') {
			console.error(error);
			return;
		}

		if (!data) return;

		const currentChannel = data.find((x) => x.voice_channel_id === newMember.voice.channelId);
		const oldNickname = data.map((x) => x.old_nickname)[0];

		if (!currentChannel && oldNickname !== newMember.displayName) {
			const { error } = await supabase
				.from('nicknames')
				.update({ old_nickname: newMember.displayName })
				.eq('user_id', newMember.id)
				.eq('guild_id', newMember.guild.id);

			if (error) {
				console.error(error);
				return;
			}
		}
	}
};

export default event;
