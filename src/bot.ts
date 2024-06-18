import { Client, GatewayIntentBits, TextChannel } from "discord.js";
import { spawn } from "child_process";
import { config } from "dotenv";
import path from "path";
import os from "os";

// 環境変数からトークンを取得
config();
const TOKEN = process.env.DISCORD_BOT_TOKEN;
const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;
const DOCKER_COMPOSE_PATH = process.env.DOCKER_COMPOSE_PATH;
const DOCKER_COMPOSE_FILE = process.env.DOCKER_COMPOSE_FILE;


if (!TOKEN) {
  console.error(
    "DISCORD_BOT_TOKEN is not defined in the environment variables."
  );
  process.exit(1);
}

if (!CHANNEL_ID) {
  console.error(
    "DISCORD_CHANNEL_ID is not defined in the environment variables."
  );
  process.exit(1);
}

if (!DOCKER_COMPOSE_PATH) {
  console.error(
    "DOCKER_COMPOSE_PATH is not defined in the environment variables."
  );
  process.exit(1);
}

if (!DOCKER_COMPOSE_FILE) {
  console.error(
    "DOCKER_COMPOSE_FILE is not defined in the environment variables."
  );
  process.exit(1);
}
console.log(`DOCKER_COMPOSE_PATH: ${DOCKER_COMPOSE_PATH}`);
console.log(`DOCKER_COMPOSE_FILE: ${DOCKER_COMPOSE_FILE}`);


const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once("ready", () => {
  console.log("Bot is ready!");
  const channel = client.channels.cache.get(CHANNEL_ID) as TextChannel;

  const homeDir = os.homedir();
  const dockerComposePath = DOCKER_COMPOSE_PATH.replace(
    /^~(\/|\\|$)/,
    `${homeDir}$1`
  );
  const dockerComposeFilePath = path.resolve(
    dockerComposePath,
    DOCKER_COMPOSE_FILE
  );

  const dockerup = spawn("docker", [
    "compose",
    "-f",
    dockerComposeFilePath,
    "up",
    "-d",
  ]);


  dockerup.stdout.on("data", (data) => {
    channel.send(`stdout: ${data}`);
  });

  dockerup.stderr.on("data", (data) => {
    channel.send(`stderr: ${data}`);
  });

  dockerup.on("close", (code) => {
    channel.send(`child process exited with code ${code}`);
  });

  // 定期実行の設定 (test,5秒ごとに実行)
  setInterval(() => {
    const channel = client.channels.cache.get(CHANNEL_ID) as TextChannel;
    if (channel) {
      const ls = spawn("docker", ["compose", "logs", "docker-com-apache-1"]); // 任意のコマンドをここに指定

      ls.stdout.on("data", (data) => {
        channel.send(`stdout: ${data}`);
      });

      ls.stderr.on("data", (data) => {
        channel.send(`stderr: ${data}`);
      });

      ls.on("close", (code) => {
        channel.send(`child process exited with code ${code}`);
      });
    } else {
      console.error("Channel not found!");
    }
  }, 5 *1000); // 5分 (5 * 60 * 1000ミリ秒)
});

// client.on("messageCreate", (message) => {
//   if (message.content === "!getlogs") {
//     const ls = spawn("ls", ["-la"]); // 任意のコマンドをここに指定

//     ls.stdout.on("data", (data) => {
//       message.channel.send(`stdout: ${data}`);
//     });

//     ls.stderr.on("data", (data) => {
//       message.channel.send(`stderr: ${data}`);
//     });

//     ls.on("close", (code) => {
//       message.channel.send(`child process exited with code ${code}`);
//     });
//   }
// });

client.login(TOKEN);
