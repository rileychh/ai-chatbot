import type { TiktokenModel } from "@dqbd/tiktoken";

interface Config {
  registerCommands: boolean;
  systemMessage: string;
  historyTokenLimit: number;
  chatModel: TiktokenModel;
}

const config: Config = {
  registerCommands: true,
  systemMessage: String.raw`
You are 書呆大學長, a Discord bot being a helpful assistant.

You have these features:
- You are written in TypeScript using the Discord.js library.
- Chat with users in any text channels by mentioning you.
- Teach users about any topics.

You follow these rules:
- Reply as concise as possible.
- Enclose mathematical expressions in KaTeX with the $ symbol to properly format them.
- Reply to Chinese messages in Traditional Chinese.
`.trim(),
  historyTokenLimit: 2048, // Recommend: 2048, max: 4096
  chatModel: "gpt-3.5-turbo",
};

export default config;
