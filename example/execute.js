const { Client, GatewayIntentBits } = require("discord.js");
const { spawn } = require("child_process");
const TOKEN = "YOUR_DISCORD_BOT_TOKEN"; // ここにあなたのボットのトークンを入力してください

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once("ready", () => {
  console.log("Bot is ready!");
});

client.on("messageCreate", (message) => {
  if (message.content === "!getlogs") {
    const ls = spawn("ls", ["-la"]); // 任意のコマンドをここに指定

    ls.stdout.on("data", (data) => {
      message.channel.send(`stdout: ${data}`);
    });

    ls.stderr.on("data", (data) => {
      message.channel.send(`stderr: ${data}`);
    });

    ls.on("close", (code) => {
      message.channel.send(`child process exited with code ${code}`);
    });
  }
});

client.login(TOKEN);

