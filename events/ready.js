module.exports = {
  name: "ready",
  once: true,
  execute(client) {
    console.log(`Ready to be a bot!\nLoggin in as ${client.user.tag}`);
  },
};
