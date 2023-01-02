import { Message, GuildEmoji } from "discord.js";
import { BotEvent, GuildEvent, GuildEventCondition, Action } from "../types";
import { getUnicodeByEmojiName } from "../functions";
import config from "../data/config.json";

const event: BotEvent = {
  name: "messageCreate",
  execute: async (message: Message) => {
    if (message.author.bot) return;

    if (message.partial) {
      try {
        return await message.fetch();
      } catch (e) {
        console.error("Something went wrong when fetching the message:", e);
        return;
      }
    }

    if (message.embeds.length > 0) {
      message.embeds.forEach((embed) => {
        if (!embed.url) return;
        message.content = message.content.replace(embed.url, "");
      });
    }

    const eventConfig: GuildEvent | undefined = config
      .find((config) => config.server == message.guild?.name)
      ?.events.find((event) => event.type == "messageCreate");

    eventConfig?.conditions.forEach(
      async (condition: GuildEventCondition) =>
        await parseEventCondition(message, condition)
    );
  },
};

async function parseEventCondition(
  message: Message,
  condition: GuildEventCondition
): Promise<void> {
  if (
    normalizedIncludes(message, condition.trigger.keywords) &&
    requiredAuthor(message, condition)
  ) {
    await performAction(message, condition.action);
  }
}

function normalizedIncludes(message: Message, keywords: string[]): boolean {
  for (const key in keywords) {
    if (keywords[key].split(" ").length == 1) {
      const content = message.content.split(" ");
      for (const word in content) {
        if (
          includes(
            content[word].replace(/[^a-zA-Z ]/g, ""),
            keywords[key],
            true
          )
        )
          return true;
      }
    } else {
      if (includes(message.content, keywords[key])) return true;
    }
  }

  return false;
}

function includes(
  content: string,
  keyword: string,
  exact: boolean = false
): boolean {
  if (exact) {
    return content.toLocaleLowerCase() == keyword.toLocaleLowerCase();
  }
  return content.toLocaleLowerCase().includes(keyword.toLocaleLowerCase());
}

function requiredAuthor(
  message: Message,
  condition: GuildEventCondition
): boolean {
  if (
    !condition.requiredAuthor.username ||
    condition.requiredAuthor.username == message.author.username
  )
    return true;

  return false;
}

async function performAction(message: Message, action: Action): Promise<void> {
  try {
    if (action.type == "react") {
      const reactContent = getEmojiByName(message, action.value);
      if (!reactContent) return;

      await message.react(reactContent);
    }

    if (action.type == "reply") {
      await message.reply(action.value);
    }
  } catch (err) {
    console.error("Something went wrong interacting with the message: ", err);
  }
}

function getEmojiByName(
  message: Message,
  emojiName: string
): GuildEmoji | string | undefined {
  const guildEmoji = message.guild?.emojis.cache.find(
    (emoji) => emoji.name == emojiName
  );
  if (guildEmoji) return guildEmoji;

  const globalEmoji = getUnicodeByEmojiName(emojiName);
  if (globalEmoji) return globalEmoji;

  return undefined;
}

export default event;
