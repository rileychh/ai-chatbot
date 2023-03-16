import { Configuration, OpenAIApi } from "openai";
import {
  encoding_for_model as encodingForModel,
  TiktokenModel,
} from "@dqbd/tiktoken";
import type { ChatCompletionRequestMessage } from "openai";
import type { Snowflake } from "discord.js";
import config from "./config";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);
export default openai;

// A map from channel ID to chat messages.
class ChatHistory extends Map<Snowflake, ChatCompletionRequestMessage[]> {
  push(channel: Snowflake, user: string, assistant: string) {
    const record = this.get(channel);
    const entry: ChatCompletionRequestMessage[] = [
      { role: "user", content: user },
      { role: "assistant", content: assistant },
    ];

    if (record) {
      record.push(...entry);

      // Remove the oldest entry until history is within limit
      while (this.tokens(channel) > config.historyTokenLimit) {
        record.shift();
      }
    } else {
      this.set(channel, entry);
    }
  }

  // Clears the Chat history for an channel.
  // Not called clear because it conflicts with Map#clear.
  reset(channel: Snowflake) {
    const record = this.get(channel);
    if (!record) return;
    record.length = 0;
  }

  tokens(channel: Snowflake, model: TiktokenModel = "gpt-3.5-turbo-0301") {
    const encoding = encodingForModel(model);

    switch (model) {
      case "gpt-3.5-turbo-0301": {
        let numTokens = 0;
        const record = this.get(channel);
        if (!record) return 0;

        for (const message of record) {
          numTokens += 4; // Every message follows <im_start>{role/name}\n{content}<im_end>\n

          for (const [key, value] of Object.entries(message)) {
            numTokens += encoding.encode(value).length;
            if (key == "name") {
              // If there's a name, the role is omitted
              numTokens -= 1; // Role is always required and always 1 token
            }
          }
        }

        numTokens += 2; // Every reply is primed with <im_start>assistant
        return numTokens;
      }
    }

    throw new Error("model is not implemented");
  }
}

export const chatHistory = new ChatHistory();

export async function chat(channel: Snowflake, message: string) {
  const history = chatHistory.get(channel) ?? [];

  const completion = await openai.createChatCompletion({
    model: config.chatModel,
    messages: [
      { role: "system", content: config.systemMessage },
      ...history,
      { role: "user", content: message },
    ],
  });

  const reply = completion.data.choices[0]?.message?.content;
  if (reply) {
    chatHistory.push(channel, message, reply);
  }

  console.log(
    `Channel ${channel} used` +
      ` ${completion.data.usage?.prompt_tokens} prompt tokens,` +
      ` ${completion.data.usage?.completion_tokens} completion tokens,` +
      ` ${completion.data.usage?.total_tokens} total tokens.\n` +
      `Channel is using ${chatHistory.tokens(channel)} tokens.`
  );

  return reply;
}
