import { Client, Events, GatewayIntentBits } from "discord.js";
import config from "./config";
import { commands, register } from "./commands";

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, (client) => {
  console.log(`Logged in as ${client.user.tag}.`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = (await commands).get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  await command.execute(interaction);
});

if (config.registerCommands) {
  (async () => {
    console.log(`Registered ${await register()} commands.`);
  })();
}

client.login(process.env.DISCORD_BOT_TOKEN);
