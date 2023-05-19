import { PermissionsBitField, VoiceState } from 'discord.js';
import { BotEvent } from '../types';
import { supabase } from '../supabase';

const event: BotEvent = {
	name: 'voiceStateUpdate',
	execute: async (oldMember: VoiceState, newMember: VoiceState) => {
		const member = newMember
			? await newMember.guild.members.fetch(newMember.id)
			: await oldMember.guild.members.fetch(oldMember.id);

		// We can't change guild owners nicknames...
		if (member.id === member.guild.ownerId) return;

		const { data, error } = await supabase
			.from('nicknames')
			.select()
			.eq('user_id', member.id)
			.eq('guild_id', member.guild.id);
		// Ignore a no row response error
		if (error && error.code !== 'PGRST116') {
			console.error(error);
			return;
		}

		if (!data) return;

		const currentChannel = data.find((x) => x.voice_channel_id === newMember.channelId);
		const oldChannel = data.find((x) => x.voice_channel_id === oldMember.channelId);

		if (
			!(await newMember.guild.members.fetchMe()).permissions.has(
				PermissionsBitField.Flags.ManageNicknames
			)
		) {
			await (
				await member.guild.fetchOwner()
			).send(
				`I do not have permissions to manage nicknames in ${member.guild.name}! Please try inviting me again to refresh permissions.`
			);
			return;
		}

		if (currentChannel) {
			await member.setNickname(currentChannel.new_nickname);
			return;
		}

		if (oldChannel) {
			await member.setNickname(oldChannel.old_nickname);
			return;
		}
	}
};

export default event;
