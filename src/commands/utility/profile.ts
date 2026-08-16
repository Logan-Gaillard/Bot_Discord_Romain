import {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  Interaction,
  ChatInputCommandInteraction,
  MessageFlags,
  escapeMarkdown
} from "discord.js";
import userProfile from "../../services/user/userProfile.js";

export default {
  data: new SlashCommandBuilder()
    .setName("profil")
    .setDescription("Permettre de connaitre les statistiques de votre profil ou celle des autres")
    .addUserOption((option) =>
      option
        .setName("utilisateur")
        .setDescription("Sélectionnez un utilisateur pour accéder à son profil.")
        .setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser("utilisateur") || interaction.user

    const profile = userProfile(user, interaction.guildId)

    if(!profile){
      return interaction.reply({content:"Aucun utilisateur trouvé", flags: MessageFlags.Ephemeral})
    }

    const xpInfo = await profile.getUserXP()

    const embed = new EmbedBuilder()
      .setTitle(`Profil de ${escapeMarkdown(user.globalName)}`)
      .setThumbnail(user.displayAvatarURL())
      .addFields(
        {
          name: "XP :",
          value: `${xpInfo.xp}`
        },
        {
          name: "Niveau :",
          value: `${xpInfo.level}`
        }
      )
      .setFooter({text: "Made with ❤️ by Octokling"})

    await interaction.channel.send({embeds: [embed]})
    await interaction.reply({content: "Profil affiché", flags: MessageFlags.Ephemeral})
  },
};
