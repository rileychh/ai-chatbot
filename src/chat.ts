import { Configuration, OpenAIApi } from "openai";
import {
  encoding_for_model as encodingForModel,
  TiktokenModel,
} from "@dqbd/tiktoken";
import { omit } from "lodash";
import type { ChatCompletionRequestMessage } from "openai";
import type { Snowflake } from "discord.js";
import config from "./config";
import { isAxiosError } from "axios";

interface ChatRecord extends ChatCompletionRequestMessage {
  id?: Snowflake;
}

// A map from channel ID to chat messages.
class ChatHistory extends Map<Snowflake, ChatRecord[]> {
  getChatCompletionRequestMessage(
    channel: Snowflake
  ): ChatCompletionRequestMessage[] | undefined {
    return this.get(channel)?.map((record) => omit(record, "id"));
  }

  push(channel: Snowflake, entries: ChatRecord[]) {
    const record = this.get(channel);

    if (record) {
      record.push(...entries);

      // Remove the oldest entry until history is within limit
      while (this.tokens(channel) > config.historyTokenLimit) {
        record.shift();
      }
    } else {
      this.set(channel, entries);
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

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
export const api = openai;

export const chatHistory = new ChatHistory();

export async function chat(
  message: string,
  channel?: Snowflake
): Promise<string> {
  const history = channel
    ? chatHistory.getChatCompletionRequestMessage(channel)
    : [];

  // Keep trying until success or tried 3 times
  let reply;
  let usage;
  let error = null;
  let tries = 0;
  do {
    error = null;
    try {
      const completion = await openai.createChatCompletion(
        {
          model: config.chatModel,
          messages: [
            { role: "system", content: config.systemMessage },
            ...(history ?? []),
            { role: "user", content: message },
          ],
          temperature: 0.7,
        },
        { timeout: 60000 }
      );

      reply = completion.data.choices[0]?.message?.content ?? null;
      usage = completion.data.usage;
    } catch (e) {
      error = e;
      if (isAxiosError(e)) {
        console.error(`openai.ts: ${e.message}`);
        reply = `OpenAI 傳回了一個錯誤： ${e.message}`;
      } else {
        console.error(`openai.ts: ${e}`);
        reply = "發生了不明的錯誤，請再試一次。";
      }
    }
  } while (error != null && tries++ < 3);

  console.log(
    ` ${usage?.prompt_tokens} tokens ` +
      `-> ${usage?.completion_tokens} tokens ` +
      `= ${usage?.total_tokens} tokens ` +
      `in Channel ${channel}`
  );

  return reply ?? "OpenAI 沒有傳回資料，請再試一次。";
}

export async function getTitle(
  channel: Snowflake,
  topic: string
): Promise<string> {
  return chat(
    `「${topic}」\n---\n為這個話題下非常簡短的標題，只回答我標題。`,
    channel
  );
}
