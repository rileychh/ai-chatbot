import type { Interaction } from "discord.js";
import { chatHistory } from "../chat";

export default async function (interaction: Interaction) {
  if (!interaction.isButton()) return;

  const content =
    chatHistory
      .get(interaction.channelId)
      ?.find((record) => record.id == interaction.message.id)?.content ??
    "Sorry, I forgot what the original text is.";

  interaction.reply({ content, ephemeral: true });
}
