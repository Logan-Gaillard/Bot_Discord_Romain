import { REST, Routes } from "discord.js";
import dotenv from "dotenv";
dotenv.config();

import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import fs from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const foldersPath = path.join(__dirname, "commands");

const token = process.env.DISCORD_TOKEN;
const rest = new REST({ version: "10" }).setToken(token);

const globalCommands: any[] = [];
const devCommands: any[] = [];

const commandFolders = fs.readdirSync(foldersPath);
for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = await import(pathToFileURL(filePath).href);
    const cmd = command.default ?? command;
    if ("data" in cmd && "execute" in cmd) {
      if (cmd.devOnly) {
        devCommands.push(cmd.data.toJSON());
      } else {
        globalCommands.push(cmd.data.toJSON());
      }
    } else {
      console.log(
        `Le fichier ${filePath} ne contient pas de propriété data ou execute.`
      );
    }
  }
}

(async () => {
  try {
    console.log(
      `Rafraîchissement de ${globalCommands.length} commandes globales et ${devCommands.length} commandes dev...`
    );

    const globalData: any = await rest.put(
      Routes.applicationCommands(process.env.APPLICATION_ID),
      { body: globalCommands }
    );
    console.log(`${globalData.length} commandes globales déployées.`);

    if (devCommands.length > 0) {
      const devData: any = await rest.put(
        Routes.applicationGuildCommands(process.env.APPLICATION_ID, process.env.DEV_GUILD_ID),
        { body: devCommands }
      );
      console.log(`${devData.length} commandes dev déployées sur le serveur de dev.`);
    }
  } catch (err) {
    console.error(err);
  }
})();