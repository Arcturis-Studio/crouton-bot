const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

const { config } = require('dotenv')

const envFile = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env';
config({ path: path.join(__dirname, envFile) });


const commands = [];
const commandsPath = path.join(__dirname, 'build', 'commands');
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith('.js'));

commandFiles.forEach((file) => {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath).default;
  commands.push(command.command.toJSON());
});

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(process.env.BOT_TOKEN);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.DEV_GUILD_ID),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();
