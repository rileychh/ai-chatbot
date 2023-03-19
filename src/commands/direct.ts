import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { directChannels } from "../services/directChat";
import type { Command } from "./types";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("直聊")
    .setDescription("在指定頻道讓機器人回覆所有訊息。")
    .addChannelOption((option) =>
      option.setName("頻道").setDescription("要指定的頻道，預設為這個頻道。")
    )
    .addBooleanOption((option) =>
      option.setName("啟用").setDescription("是否啟用該功能，預設為切換開關。")
    )
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const channel =
      interaction.options.getChannel("頻道")?.id ?? interaction.channelId;
    const enable =
      interaction.options.getBoolean("啟用") ?? !directChannels.has(channel);

    if (enable) {
      directChannels.add(channel);
    } else {
      directChannels.delete(channel);
    }

    await interaction.reply(
      `已將頻道 <#${channel}> 的直聊功能設為${enable ? "啟用" : "停用"}。`
    );
  },
};

export default command;
