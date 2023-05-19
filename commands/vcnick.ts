import {
	ChannelType,
	SlashCommandBuilder,
	PermissionFlagsBits,
	ChatInputCommandInteraction,
	ActionRowBuilder,
	StringSelectMenuBuilder,
	ComponentType,
	PermissionsBitField
} from 'discord.js';
import { SlashCommand } from '../types';
import { supabase } from '../supabase';

const command: SlashCommand = {
	command: new SlashCommandBuilder()
		.setName('vcnick')
		.setDescription('Automatically changes your nickname when joining a voice channel.')
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.ChangeNickname)
		.addSubcommand((cmd) =>
			cmd
				.setName('set')
				.setDescription('Set your vc nickname')
				.addStringOption((opt) =>
					opt.setName('nickname').setDescription('The nickname to change to').setRequired(true)
				)
				.addChannelOption((opt) =>
					opt
						.setName('channel')
						.setDescription('The channel to change to')
						.addChannelTypes(ChannelType.GuildVoice)
						.setRequired(true)
				)
		)
		.addSubcommand((cmd) =>
			cmd
				.setName('reset')
				.setDescription('Removes channel nicknames.')
				.addBooleanOption((opt) =>
					opt.setName('all').setDescription('Removes all channel nicknames.').setRequired(true)
				)
		),
	execute: async (interaction) => {
		await interaction.deferReply({ ephemeral: true });

		if (
			!(await interaction.guild?.members.fetchMe())?.permissions.has(
				PermissionsBitField.Flags.ManageNicknames
			)
		) {
			await (
				await interaction.guild?.fetchOwner()
			)?.send(
				`I do not have permissions to manage nicknames in ${interaction.guild?.name}! Please try inviting me again to refresh permissions.`
			);

			await interaction.editReply(
				`I do not have permissions to manage nicknames in here! I've already sent a DM to the server owner!\nSit tight! The oven is hot!`
			);
			await timeoutDelete(interaction);
			return;
		}

		if (interaction.user.id === interaction.guild?.ownerId) {
			await interaction.editReply(
				`Unfortunately, bots do not have the ability to change server owner nicknames.`
			);
			return;
		}

		//
		// RESET
		//
		if (interaction.options.getSubcommand() === 'reset') {
			const all = interaction.options.getBoolean('all');
			if (all) {
				const { error } = await supabase
					.from('nicknames')
					.delete()
					.eq('guild_id', interaction.guildId)
					.eq('user_id', interaction.user.id);

				if (error) {
					console.error(error);
					await generalErrorMessage(interaction);
					return;
				}
				await interaction.editReply(`You got it! All of your orders are out of the oven!`);
				await timeoutDelete(interaction);
				return;
			}

			const { data, error } = await supabase
				.from('nicknames')
				.select()
				.eq('guild_id', interaction.guildId)
				.eq('user_id', interaction.user.id);

			if (error) {
				console.error(error);
				await generalErrorMessage(interaction);
				return;
			}

			if (!data) {
				await interaction.editReply('There was not anything in the bakery. You are good to go!');
				await timeoutDelete(interaction);
				return;
			}

			const channels = await interaction.guild?.channels.fetch();

			if (!channels) {
				await generalErrorMessage(interaction);
				return;
			}

			const validChannels = channels
				.filter((x) => {
					return data.some((c) => {
						return c.voice_channel_id === x?.id;
					});
				})
				.map((x) => {
					return {
						label: x?.name!,
						value: x?.id!
					};
				});

			const resetSelection = new StringSelectMenuBuilder()
				.setCustomId('channel')
				.setOptions(validChannels)
				.setMinValues(1)
				.setMaxValues(validChannels.length <= 1 ? validChannels.length : validChannels.length - 1);

			const response = await interaction.editReply({
				content: 'Select which channels you would like to take out of the oven.',
				components: [
					new ActionRowBuilder<StringSelectMenuBuilder>().setComponents([resetSelection])
				]
			});
			response
				.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 60000 })
				.on('collect', async (collectorInteraction) => {
					const selections = validChannels.filter((x) => {
						return collectorInteraction.values.some((v) => {
							return v === x.value;
						});
					});

					const { error } = await supabase
						.from('nicknames')
						.delete()
						.eq('guild_id', collectorInteraction.guildId)
						.eq('user_id', collectorInteraction.user.id)
						.in('voice_channel_id', collectorInteraction.values);
					if (error) {
						console.error(error);
						await generalErrorMessage(interaction);
						return;
					}

					selections.forEach((v) => validChannels.splice(validChannels.indexOf(v), 1));

					resetSelection
						.setOptions(validChannels)
						.setMaxValues(
							validChannels.length <= 1 ? validChannels.length : validChannels.length - 1
						);

					if (validChannels.length === 0) {
						collectorInteraction.update({
							content: `You got it. **${
								selections.length <= 1
									? selections[0].label
									: selections.map((s) => s.label).join(', ')
							}** is out of the oven.\nThere's nothing left to do here!`,
							components: []
						});
					} else {
						collectorInteraction.update({
							content: `You got it. **${
								selections.length <= 1
									? selections[0].label
									: selections.map((s) => s.label).join(', ')
							}** is out of the oven.`,
							components: [
								new ActionRowBuilder<StringSelectMenuBuilder>().setComponents([resetSelection])
							]
						});
					}
				})
				.on('end', async () => {
					await interaction.deleteReply();
				});

			return;
		}

		//
		// SET
		//
		if (interaction.options.getSubcommand() === 'set') {
			const nickname = interaction.options.getString('nickname');
			const channel = interaction.options.getChannel('channel');

			// This check should not ever be needed as Discord's command validation should handle this.
			if (!nickname || !channel) {
				await interaction.editReply(
					`I'm missing some information. Please provide both a nickname and a channel name.`
				);
				return;
			}

			const member = await interaction.guild?.members.fetch(interaction.user.id);

			if (!member) {
				await generalErrorMessage(interaction);
				return;
			}

			const { data, error } = await supabase.from('nicknames').upsert({
				old_nickname: member.displayName,
				new_nickname: nickname,
				user_id: member.id,
				voice_channel_id: channel.id,
				guild_id: member.guild.id
			});

			if (error) {
				await generalErrorMessage(interaction);
				console.error(error);
				return;
			}

			await interaction.editReply(
				`Awesome nickname! Your nickname will be automatically changed to **${nickname}** when you join **${channel.name}**! Your name will be changed back to **${member.displayName}** when you leave.`
			);

			await timeoutDelete(interaction);
			return;
		}
	},
	cooldown: 10
};

async function timeoutDelete(interaction: ChatInputCommandInteraction) {
	setTimeout(async () => {
		await interaction.deleteReply();
	}, 30000);
}

async function generalErrorMessage(interaction: ChatInputCommandInteraction) {
	await interaction.editReply(
		'Something went wrong in the bakery. Please try sending your order again.'
	);
	await timeoutDelete(interaction);
}

export default command;
