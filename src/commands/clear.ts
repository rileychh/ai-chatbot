import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { chatHistory } from "../chat";
import type { Command } from "./types";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("清除")
    .setDescription("清除頻道的對話記錄")
    .addChannelOption((option) =>
      option.setName("頻道").setDescription("要清除的頻道，預設是現在的頻道。")
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const channel =
      interaction.options.getChannel("頻道")?.id ?? interaction.channelId;

    chatHistory.reset(channel);

    await interaction.reply(`已清除<#${channel}>。`);
  },
};

export default command;
