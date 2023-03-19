// Handler for the showOriginal button

import type { Interaction } from "discord.js";
import { chatHistory } from "../chat";

export default async function (interaction: Interaction) {
  if (!interaction.isButton()) return;

  const original = chatHistory
    .get(interaction.channelId)
    ?.find((record) => record.id == interaction.message.id)?.content;

  const content = original
    ? "```md\n" + original + "\n```" // Wrap in code block
    : "抱歉，我忘記原文是什麼了。";

  interaction.reply({
    content,
    ephemeral: true,
  });
}
