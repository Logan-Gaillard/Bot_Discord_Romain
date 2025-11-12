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

const commands = [];

const commandFolders = fs.readdirSync(foldersPath);
for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = await import(pathToFileURL(filePath).href);
    const cmd = command.default ?? command; // support export default
    if ("data" in cmd && "execute" in cmd) {
      commands.push(cmd.data.toJSON());
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
      `Début du rafraîchissement des ${commands.length} commandes d'application.`
    );
    const data: any = await rest.put(
      Routes.applicationCommands(process.env.APPLICATION_ID),
      { body: commands }
    );
    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`
    );
  } catch (err) {
    console.error(err);
  }
})();
