import {
  ApplicationCommandType,
  ContextMenuCommandBuilder,
  ThreadChannel,
} from "discord.js";
import { chat, chatHistory, getTitle } from "../chat";
import { hasMath, renderMessage } from "../render";
import { directChannels } from "../services/directChat";
import { removeMention } from "../services/mentionChat";
import type { Command } from "./types";

const command: Command = {
  data: new ContextMenuCommandBuilder()
    .setName("和學長討論")
    .setType(ApplicationCommandType.Message),
  async execute(interaction) {
    if (!interaction.isMessageContextMenuCommand()) return;

    const { targetMessage: message, channel } = interaction;

    if (!channel) return;
    if (!("threads" in channel)) return;

    interaction.deferReply({ ephemeral: true });

    let thread: ThreadChannel;
    if (message.hasThread) {
      thread = message.thread as ThreadChannel;
    } else {
      thread = await channel.threads.create({
        name: await getTitle(channel.id, message.content),
        startMessage: message.id,
      });
    }

    thread.sendTyping();
    const typing = setInterval(async () => {
      await thread.sendTyping();
    }, 10000);

    const chatMessage = removeMention(
      interaction.client.user.id,
      message.content
    );
    const reply = await chat(chatMessage, channel.id);

    let replyMessage;
    if (hasMath(reply)) {
      replyMessage = await thread.send(await renderMessage(reply));
    } else {
      replyMessage = await thread.send(reply);
    }
    clearInterval(typing);

    chatHistory.push(thread.id, [
      { id: message.id, role: "user", content: message.content },
      { id: replyMessage.id, role: "assistant", content: reply },
    ]);
    directChannels.push(thread.id);

    await interaction.editReply("已經在討論串回答你了，開始討論吧！");
  },
};

export default command;
