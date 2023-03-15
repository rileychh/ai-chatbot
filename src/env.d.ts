declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DISCORD_BOT_TOKEN: string;
      OPENAI_API_KEY: string;
    }
  }
}

export {};
