import {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  Interaction,
  ChatInputCommandInteraction,
  MessageFlags,
  escapeMarkdown,
  APIEmbedField,
  RestOrArray
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
    const isLooking = !!interaction.options.getUser("utilisateur")
    const user = interaction.options.getUser("utilisateur") || interaction.user

    const profile = userProfile(user, interaction.guildId)

    if(!profile){
      return interaction.reply({content:"Aucun utilisateur trouvé", flags: MessageFlags.Ephemeral})
    }

    const xpInfo = await profile.getUserXP()

    let fields :  RestOrArray<APIEmbedField> = [
      {
        name: "Niveau :",
        value: `${xpInfo.level}`,
        inline: true
      },
      {
        name: "XP :",
        value: `${xpInfo.xp}`,
        inline: true
      }
    ]

    if(!isLooking){
      fields = [
        ...fields,
        {
          name: "Malices",
          value: `${xpInfo.coins}`
        }
      ]
    }

    const embed = new EmbedBuilder()
      .setTitle(`Profil de ${escapeMarkdown(user.globalName)}`)
      .setDescription(isLooking && `Demandé par <@${interaction.user.id}>`)
      .setThumbnail(user.displayAvatarURL())
      .addFields(fields)
      .setFooter({text: "Made by Octokling"})

    await interaction.channel.send({embeds: [embed]})
    await interaction.reply({content: "Profil affiché", flags: MessageFlags.Ephemeral})
  },
};
