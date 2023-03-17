import type { Command } from "./types";
import { readdir } from "fs/promises";
import { ApplicationCommand, REST, Routes } from "discord.js";

export const commands = (async () => {
  const commands = new Map<string, Command>();
  const commandFiles = await readdir(__dirname);

  for (const file of commandFiles) {
    if (
      (file.endsWith(".ts") || file.endsWith(".js")) &&
      !file.startsWith("index") &&
      !file.startsWith("types")
    )
      if (file != "index.ts" && file != "types.ts") {
        const { default: command } = await import(`${__dirname}/${file}`);
        commands.set(command.data.name, command);
      }
  }

  return commands;
})();

export async function register() {
  const rest = new REST({ version: "10" }).setToken(
    process.env.DISCORD_BOT_TOKEN
  );

  const body = [];
  for (const [, command] of await commands) {
    body.push(command.data.toJSON?.());
  }

  const data = (await rest.put(
    Routes.applicationCommands(process.env.DISCORD_APPLICATION_ID),
    { body }
  )) as ApplicationCommand[];

  return data.length;
}
