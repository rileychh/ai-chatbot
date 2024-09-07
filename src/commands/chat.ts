import { SlashCommandBuilder } from "discord.js";
import type { Command } from "./types";
import { chat, chatHistory } from "../chat";
import { hasMath, renderMessage } from "../render";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("對話")
    .setDescription("和機器人對話！")
    .addStringOption((option) =>
      option
        .setName("訊息")
        .setDescription("要傳給機器人的訊息")
        .setRequired(true)
    ),
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const content = interaction.options.getString("訊息") as string;
    console.log(`Command chat message: ${content}`);

    await interaction.deferReply();
    const reply = await chat(content, interaction.channelId);

    // If reply contains math, render the reply into image.
    let replyMessage;
    if (hasMath(reply)) {
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
