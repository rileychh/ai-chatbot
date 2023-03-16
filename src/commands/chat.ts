import { AttachmentBuilder, SlashCommandBuilder } from "discord.js";
import nodeHtmlToImage from "node-html-to-image";
import MarkdownIt from "markdown-it";
// @ts-expect-error @iktakahiro/markdown-it-katex Has no types
import MarkdownItKatex from "@iktakahiro/markdown-it-katex";
import type { Command } from "./types";
import { readFile } from "fs/promises";
import { chat } from "../openai";

async function markdownToImage(markdown: string) {
  const md = new MarkdownIt();
  md.use(MarkdownItKatex);
  const renderedBody = md.render(markdown);

  return (await nodeHtmlToImage({
    html: (await readFile("src/math.handlebars")).toString(),
    content: {
      body: renderedBody,
    },
    selector: "#contents",
  })) as Buffer;
}

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("chat")
    .setDescription("Chat with the bot, with math equations!")
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("The message to the bot")
        .setRequired(true)
    ),
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const message = interaction.options.getString("message");
    if (!message) {
      console.error("/chat: No message provided.");
      return;
    }

    interaction.deferReply();
    const reply = await chat(interaction.channelId, message);

    if (reply == undefined) {
      interaction.editReply("Sorry, an error has occurred.");
      return;
    }

    // If reply contains math, render the reply into image.
    if (/\${1,2}.*?\${1,2}/g.test(reply)) {
      await interaction.editReply("Rendering math...");
      const img = await markdownToImage(reply);
      await interaction.editReply({
        content: "",
        files: [new AttachmentBuilder(img)],
      });
    } else {
      await interaction.editReply(reply);
    }
  },
};

export default command;
