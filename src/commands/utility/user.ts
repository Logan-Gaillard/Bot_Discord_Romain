import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Affiche les informations de l'utilisateur."),

  async execute(interaction: any) {
    const user = interaction.user;
    const userInfo = `Voici les informations de l'utilisateur :
                    - Nom d'utilisateur : ${user.username}
                    - ID : ${user.id}
                    - Bot : ${user.bot ? "Oui" : "Non"}
                    - Créé le : ${user.createdAt.toDateString()}`;
    await interaction.reply(userInfo);
  },
};
