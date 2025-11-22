import { Events, GuildMember } from "discord.js";
import { makeWelcomeImage } from "../utils/imageTraitement.js";

export default {
  name: Events.GuildMemberAdd,
  async execute(member: GuildMember) {
    //Fase de test, uniquement ne pas exécuter si ce n'est pas sur le serv de dev
    if (member.guild.id !== "1437881720421744662") return;

    //Envoie d'un message de bienvenue dans le channel "general" du serveur
    const channel = member.guild.channels.cache.find(
      (ch) => ch.name === "✈️・ᴀʀʀɪᴠᴀɴᴛ"
    );
    if (!channel || !channel.isTextBased()) return;
    let pathImage = await makeWelcomeImage(member.user);

    console.log(pathImage);

    await channel.send({ files: [pathImage] });

    console.log(
      `Nouveau membre : ${member.user.tag} a rejoint le serveur ${member.guild.name}`
    );
  },
};
