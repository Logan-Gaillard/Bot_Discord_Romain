import {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  MessageFlags,
} from "discord.js";

import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import fs from "node:fs";

import dotenv from "dotenv";
dotenv.config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
}) as any;
client.commands = new Collection();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Importation dynamique des commandes depuis le dossier "commands"
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);

    // Convertit le chemin en file:// URL pour l'import dynamique
    const command = await import(pathToFileURL(filePath).href);

    const cmd = command.default ?? command;
    if ("data" in cmd && "execute" in cmd) {
      client.commands.set(cmd.data.name, cmd);
    } else {
      console.log(
        `Le fichier ${filePath} ne contient pas de propriété data ou execute.`
      );
    }
  }
}

const eventsPath = path.join(__dirname, "events");
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith(".js"));
for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = await import(pathToFileURL(filePath).href);
  const evt = event.default ?? event;
  if (evt.once) {
    client.once(evt.name, (...args) => evt.execute(...args));
  } else {
    client.on(evt.name, (...args) => evt.execute(...args));
  }
}

const token = process.env.DISCORD_TOKEN ? process.env.DISCORD_TOKEN : "";
client.login(token);
