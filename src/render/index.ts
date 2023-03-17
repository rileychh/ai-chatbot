import MarkdownIt from "markdown-it";
// @ts-expect-error @iktakahiro/markdown-it-katex Has no types
import MarkdownItKatex from "@iktakahiro/markdown-it-katex";
import nodeHtmlToImage from "node-html-to-image";
import { readFile } from "fs/promises";
import {
  ActionRowBuilder,
  AttachmentBuilder,
  BaseMessageOptions,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";

export function hasMath(message: string) {
  return /\${1,2}.*?\${1,2}/g.test(message);
}

export async function markdownToImage(markdown: string) {
  const md = new MarkdownIt();
  md.use(MarkdownItKatex);
  const renderedBody = md.render(markdown);

  return (await nodeHtmlToImage({
    html: (await readFile(`${__dirname}/math.handlebars`)).toString(),
    content: {
      body: renderedBody,
    },
    selector: "#contents",
    puppeteerArgs: {
      ...(process.env.DOCKER && {
        executablePath: "/usr/bin/google-chrome",
        args: ["--no-sandbox"],
      }),
    },
  })) as Buffer;
}

export async function renderMessage(
  content: string
): Promise<BaseMessageOptions> {
  const image = await markdownToImage(content);
  const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("showOriginal")
      .setLabel("Show original")
      .setStyle(ButtonStyle.Secondary)
  );

  return {
    content: "",
    files: [new AttachmentBuilder(image)],
    components: [actionRow],
  };
}
