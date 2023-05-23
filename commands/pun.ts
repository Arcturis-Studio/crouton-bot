import { SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from '../types';
import { supabase } from '../supabase';
import { generalErrorMessage, timeoutDelete } from '../utils/functions';
import { Database } from '../supabase/database';

const command: SlashCommand = {
	command: new SlashCommandBuilder().setName('pun').setDescription('Says a random pun'),
	execute: async (interaction) => {
		await interaction.deferReply();
		const { data, error } = await supabase
			.from('puns')
			.select()
			.or(`guild_id.is.null,guild_id.eq.${interaction.guildId}`);

		if (error) {
			console.error(error);
			await generalErrorMessage(interaction);
			return;
		}

		if (!data) {
			await interaction.editReply('Uh oh... There was nothing in the in the oven!');
			await timeoutDelete(interaction);
			return;
		}

		interaction.editReply(getRandomPun(data).pun);
	},
	cooldown: 10
};

function getRandomPun(puns: Array<Database['public']['Tables']['puns']['Row']>) {
	const ranNum = Math.round(Math.random() * (puns.length - 0) + 0);

	return puns[ranNum];
}

export default command;
