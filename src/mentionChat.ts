// Chat with the bot by mentioning.

import type { BaseMessageOptions, Message } from "discord.js";
import { chat, chatHistory } from "./chat";
import { hasMath, renderMessage } from "./render";

export default async function (message: Message) {
  if (!message.client.user) return;
  if (!message.mentions.has(message.client.user)) return;

  // The chat input is the message after the last bot mention.
  // message.content: "@friend Let's ask the bot. @bot What is foo?"
  // chatMessage: "What is foo?"
  const chatMessage = message.content
    .split(`<@&${message.client.user.id}>`)
    .at(-1)
    ?.trim();
  if (!chatMessage) return; // Ignore empty messages

  // Make the bot typing while we wait for the reply.
  await message.channel.sendTyping();
  const typing = setInterval(async () => {
    await message.channel.sendTyping();
  }, 10000);

  const reply = await chat(message.channelId, chatMessage);
  clearInterval(typing);

  if (!reply) {
    await message.reply("Sorry, an error has occurred.");
    return;
  }

  const channelMessages = await message.channel.messages.fetch({ limit: 1 });
  const isLastMessage = channelMessages.last()?.id == message.id;
  const replyMethod = (content: string | BaseMessageOptions) =>
    isLastMessage ? message.channel.send(content) : message.reply(content);

  // If reply contains math, render the reply into image.
  let replyMessage;
  if (hasMath(reply)) {
    replyMessage = await replyMethod(await renderMessage(reply));
  } else {
    replyMessage = await replyMethod(reply);
  }

  chatHistory.push(message.channelId, [
    {
      id: message.id,
      role: "user",
      content: message.content,
    },
    {
      id: replyMessage.id,
      role: "assistant",
      content: reply,
    },
  ]);
}
