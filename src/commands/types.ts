import type { CommandInteraction, SlashCommandBuilder } from "discord.js";

export interface Command {
  data: Partial<SlashCommandBuilder>;
  execute: (interaction: CommandInteraction) => Promise<void>;
}
