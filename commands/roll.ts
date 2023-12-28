import { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from '../types';
import { generalErrorMessage } from '../utils/functions';
import { Roll } from '../structs/Roll';

const command: SlashCommand = {
	command: new SlashCommandBuilder()
		.setName('roll')
		.setDescription('Roll the dice!')
		.addStringOption((option) =>
			option
				.setName('dice')
				.setDescription(
					'Specify your roll as 1d4 3d20 etc. You can chain dice together by separating them with a space.'
				)
				.setRequired(true)
		),
	execute: async (interaction) => {
		await interaction.deferReply();

		const dice = interaction.options.getString('dice');

		const rerollButton = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder().setCustomId('reroll').setLabel('Reroll').setStyle(ButtonStyle.Primary)
		);

		if (!dice) {
			await generalErrorMessage(interaction);
			return;
		}

		// NOTE: Have to try/catch this as a setter is used to pattern match the diceList
		// Is there a better way to document this? A better way to do this?
		try {
			const roll = new Roll(dice);

			// TODO: Send rerollButton
			await interaction.editReply({
				content: roll.generateMessage(),
				components: [rerollButton]
			});
		} catch (error) {
			// TODO: Implement a better error handler. Need to be able to optionally customize the error message,
			// especially since this wil be seen by the user. It should point out how to resolve the issue.
			await generalErrorMessage(interaction);
			return;
		}
	},
	cooldown: 10
};

export default command;
