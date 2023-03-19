import { Client, Events, GatewayIntentBits, Partials } from "discord.js";
import config from "./config";
import { commands, register } from "./commands";
import mentionChat from "./services/mentionChat";
import showOriginal from "./services/showOriginal";
import exclusiveChat from "./services/directChat";

const client = new Client({
  partials: [Partials.Channel],
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  allowedMentions: { parse: [] },
});

client.once(Events.ClientReady, (client) => {
  console.log(`Logged in as ${client.user.tag}.`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = (await commands).get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  await command.execute(interaction);
});

client.on(Events.MessageCreate, mentionChat);
client.on(Events.MessageCreate, exclusiveChat);
client.on(Events.InteractionCreate, showOriginal);

if (config.registerCommands) {
  (async () => {
    console.log(`Registered ${await register()} commands.`);
  })();
}

client.login(process.env.DISCORD_BOT_TOKEN);
