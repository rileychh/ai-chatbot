import { SlashCommandBuilder } from "discord.js";
import type { Command } from "./types";
import { chat, chatHistory } from "../chat";
import { hasMath, renderMessage } from "../render";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("chat")
    .setDescription("Chat with the bot, with math equations!")
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("The message to the bot")
        .setRequired(true)
    ),
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const content = interaction.options.getString("message");
    if (!content) {
      console.error("/chat: No message provided.");
      return;
    }
    console.log(`Command chat message: ${content}`);

    interaction.deferReply();
    const reply = await chat(interaction.channelId, content);

    if (!reply) {
      interaction.editReply("Sorry, an error has occurred.");
      return;
    }

    // If reply contains math, render the reply into image.
    let replyMessage;
    if (hasMath(reply)) {
      await interaction.editReply("Rendering math...");
      replyMessage = await interaction.editReply(await renderMessage(reply));
    } else {
      replyMessage = await interaction.editReply(reply);
    }

    chatHistory.push(interaction.channelId, [
      {
        role: "user",
        content: content,
      },
      {
        id: replyMessage.id,
        role: "assistant",
        content: reply,
      },
    ]);
  },
};

export default command;
