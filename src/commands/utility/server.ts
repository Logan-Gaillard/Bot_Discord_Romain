import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("Affiche les informations du serveur."),

  async execute(interaction) {
    await interaction.reply(`
            Voici les informations du serveur :
            - Nom du serveur : ${interaction.guild.name}
            - ID : ${interaction.guild.id}
            - Nombre de membres : ${interaction.guild.memberCount}
            - Créé le : ${interaction.guild.createdAt.toDateString()}
            `);
  },
};
