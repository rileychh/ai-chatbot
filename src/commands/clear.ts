import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { chatHistory } from "../chat";
import type { Command } from "./types";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Clears the chat history.")
    .addChannelOption((option) =>
      option.setName("channel").setDescription("The channel to clear")
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const channel =
      interaction.options.getChannel("channel")?.id ?? interaction.channelId;

    chatHistory.reset(channel);

    await interaction.reply({
      content: `Cleared <#${channel}>.`,
      ephemeral: true,
    });
  },
};

export default command;
