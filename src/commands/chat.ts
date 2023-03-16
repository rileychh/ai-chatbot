import { SlashCommandBuilder } from "discord.js";
import { chat } from "../openai";
import type { Command } from "./types";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("chat")
    .setDescription("Chat with the bot!")
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("The message to the bot")
        .setRequired(true)
    ),
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const message = interaction.options.getString("message");
    if (!message) {
      console.error(message);
      return;
    }

    interaction.deferReply();
    const reply = await chat(interaction.channelId, message);

    if (reply == undefined) {
      interaction.editReply("Sorry, an error has occurred.");
      return;
    }

    await interaction.editReply(reply);
  },
};

export default command;
