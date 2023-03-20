import { ApplicationCommandType, ContextMenuCommandBuilder } from "discord.js";
import { getSummery } from "../chat";
import { hasMath, renderMessage } from "../render";
import { removeMention } from "../services/mentionChat";
import type { Command } from "./types";

const command: Command = {
  data: new ContextMenuCommandBuilder()
    .setName("總結")
    .setType(ApplicationCommandType.Message),
  async execute(interaction) {
    if (!interaction.isMessageContextMenuCommand()) return;

    const { targetMessage: message, channelId } = interaction;

    interaction.deferReply({ ephemeral: true });

    const chatMessage = removeMention(
      interaction.client.user.id,
      message.content
    );
    const reply = await getSummery(channelId, chatMessage);

    if (hasMath(reply)) {
      await interaction.editReply(await renderMessage(reply));
    } else {
      await interaction.editReply(reply);
    }
  },
};

export default command;
