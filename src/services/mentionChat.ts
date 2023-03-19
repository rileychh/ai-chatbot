// Chat with the bot by mentioning.

import type { BaseMessageOptions, Message } from "discord.js";
import { chat, chatHistory } from "../chat";
import { hasMath, renderMessage } from "../render";

export default async function (message: Message) {
  if (!message.client.user) return;
  if (message.author.id == message.client.user.id) return; // Don't reply to self
  if (!message.mentions.has(message.client.user, { ignoreEveryone: true }))
    return;

  // The chat input is the message without the bot mention
  // Before: "@friend Let's ask the bot. @bot What is foo?"
  // After: "@friend Let's ask the bot. What is foo?"
  // Before: "I'm not sure, @friend. What is foo? @bot"
  // After: "I'm not sure, @friend. What is foo?"
  const botId = message.client.user.id;
  const botMentionPattern = new RegExp(String.raw`\s*<@!?(${botId})>\s*`, "g");
  const chatMessage = message.content.replace(botMentionPattern, "");
  console.log(`Mention chat message: ${chatMessage}`);

  // Make the bot typing while we wait for the reply.
  await message.channel.sendTyping();
  const typing = setInterval(async () => {
    await message.channel.sendTyping();
  }, 10000);

  const reply = await chat(chatMessage, message.channelId);

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
  clearInterval(typing);

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
