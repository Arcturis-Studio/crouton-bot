module.exports = {
  name: "messageReactionAdd",
  once: false,
  async execute(reaction, user, client, config, ewokese) {
    if (!(reaction.emoji.name == "📜" || reaction.emoji.name == "ewok")) return;

    if (reaction.partial) {
      try {
        await reaction.fetch();
      } catch (e) {
        console.error("Something went wrong when fetching message:", e);
        return;
      }
    }

    if (reaction.message.content.includes("https://")) return;

    const englishKeys = invertJSONKeyValues(ewokese);

    await reaction.message.reply(
      normalizedIncludes(reaction.message, englishKeys)
    );
  },
};

// This is also removing special characters from the original text. Stop that.
function normalizedIncludes(message, keywords) {
  let translationArray = [];
  message.content.split(" ").forEach((word) => {
    translationArray.push(
      keywords[word.toLocaleLowerCase().replace(/[^a-zA-Z ]/g, "")]
        ? word.replace(
            word.replace(/[^a-zA-Z ]/g, ""),
            keywords[word.toLocaleLowerCase().replace(/[^a-zA-Z ]/g, "")]
          )
        : word
    );
  });
  return translationArray.join(" ");
}

function invertJSONKeyValues(lang) {
  let newLang = {};

  for (const key in lang) {
    const value = lang[key];
    if (Array.isArray(value)) {
      value.forEach((val) => {
        newLang[val] = key;
      });
    } else {
      newLang[value] = key;
    }
  }

  return newLang;
}
