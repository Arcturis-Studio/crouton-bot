import {
	SlashCommandBuilder,
	EmbedBuilder,
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder,
	ComponentType
} from 'discord.js';
import { SlashCommand } from '../types';
import { generalErrorMessage, timeoutDelete } from '../utils/functions';
import { diceParser } from '../utils/diceParser';

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

		if (!dice) {
			await generalErrorMessage(interaction);
			return;
		}

		const results = diceParser(dice);

		const rollEmbed = new EmbedBuilder()
			.setColor(0x0099ff)
			.setTitle("Here's your roll results!")
			.setTimestamp();

		const rerollButton = new ButtonBuilder()
			.setCustomId('reroll')
			.setLabel('Reroll')
			.setStyle(ButtonStyle.Primary);

		const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(rerollButton);

		rollEmbed.setAuthor({ name: interaction.user.username });

		results.forEach((roll) => {
			rollEmbed.addFields({
				name: `${roll.num}d${roll.sides}`,
				value: `${roll.roll}`,
				inline: true
			});
		});

		rollEmbed.addFields({
			name: 'Total',
			value: results
				.map((roll) => roll.roll)
				.reduce((a, b) => a + b)
				.toString(),
			inline: false
		});

		await interaction.editReply({ embeds: [rollEmbed], components: [actionRow] });
	},
	cooldown: 10
};

export default command;
