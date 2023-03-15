declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DISCORD_BOT_TOKEN: string;
      DISCORD_APPLICATION_ID: string;
      OPENAI_API_KEY: string;
    }
  }
}

export {};
