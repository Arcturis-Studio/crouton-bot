import {
  SlashCommandBuilder,
  CommandInteraction,
  Collection,
  Message,
  AutocompleteInteraction,
  Events,
  messageLink,
  ReplyOptions,
} from "discord.js";
// import mongoose from "mongoose";

export interface SlashCommand {
  command: SlashCommandBuilder | any;
  execute: (interaction: CommandInteraction) => void;
  autocomplete?: (interaction: AutocompleteInteraction) => void;
  cooldown?: number; // in seconds
}

interface GuildOptions {
  prefix: string;
}

// export interface IGuild extends mongoose.Document {
//   guildID: string;
//   options: GuildOptions;
//   joinedAt: Date;
// }

export type GuildOption = keyof GuildOptions;

export interface BotEvent {
  name: string;
  once?: boolean | false;
  execute: (...args) => void;
}

export type Config = GuildConfig[];

interface GuildConfig {
  server: string;
  events: GuildEvent[];
}

interface GuildEvent {
  type: string | Events;
  conditions: GuildEventCondition[];
}

interface GuildEventCondition {
  name: string;
  requiredAuthor: { username: string | null };
  trigger: { keywords: string[] };
  action: Action;
}

interface Action {
  type: "reply" | "react" | string;
  value: string;
}

interface EmojiLib {
  [key: string]: EmojiData;
}

interface EmojiData {
  name: string;
  keywords: string[];
  slug: string;
  group: string;
  emoji_version: string;
  unicode_verison: string;
  skin_tone_support: boolean;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      BOT_TOKEN: string;
      CLIENT_ID: string;
      MONGO_URI: string;
      MONGO_DATABASE_NAME: string;
    }
  }
}

declare module "discord.js" {
  export interface Client {
    slashCommands: Collection<string, SlashCommand>;
    commands: Collection<string, Command>;
    cooldowns: Collection<string, number>;
  }
}
