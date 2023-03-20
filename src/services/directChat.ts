// Chat with the bot without mentioning in DM or select channels.

import type { BaseMessageOptions, Message, Snowflake } from "discord.js";
import { chat, chatHistory } from "../chat";
import { hasMath, renderMessage } from "../render";

// Array of channels to automatically reply to.
export const directChannels: Set<Snowflake> = new Set();

export default async function (message: Message) {
  const { author, client, channel, id, content } = message;

  if (author.id == client.user.id) return; // Don't reply to self
  if (!(channel.isDMBased() || directChannels.has(channel.id))) return;

  await channel.sendTyping();
  const typing = setInterval(async () => {
    await message.channel.sendTyping();
  }, 10000);

  const reply = await chat(content, channel.id);

  const channelMessages = await channel.messages.fetch({ limit: 1 });
  const isLastMessage = channelMessages.last()?.id == id;
  const replyMethod = (content: string | BaseMessageOptions) =>
    isLastMessage ? channel.send(content) : message.reply(content);

  let replyMessage;
  if (hasMath(reply)) {
    replyMessage = await replyMethod(await renderMessage(reply));
  } else {
    replyMessage = await replyMethod(reply);
  }
  clearInterval(typing);

  chatHistory.push(channel.id, [
    { id, role: "user", content },
    { id: replyMessage.id, role: "assistant", content: reply },
  ]);
}
