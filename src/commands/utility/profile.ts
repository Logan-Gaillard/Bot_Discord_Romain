import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  MessageFlags,
  escapeMarkdown,
  APIEmbedField
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
    const isLooking = !!interaction.options.getUser("utilisateur");
    const user = interaction.options.getUser("utilisateur") || interaction.user;

    const profile = userProfile(user, interaction.guildId);

    if (!profile) {
      return interaction.reply({ content: "Aucun utilisateur trouvé", flags: MessageFlags.Ephemeral });
    }

    const xpInfo = await profile.getUserXP();

    let fields: APIEmbedField[] = [
      { name: "Niveau :", value: `${xpInfo.level}`, inline: true },
      { name: "XP :", value: `${xpInfo.xp}`, inline: true }
    ];

    if (!isLooking) {
      fields.push({ name: "Malices", value: `${xpInfo.coins}`, inline: false });
    }

    const embed = new EmbedBuilder()
      .setTitle(`Profil de ${escapeMarkdown(user.globalName ?? user.username)}`)
      .setDescription(isLooking ? `Demandé par <@${interaction.user.id}>` : null)
      .setThumbnail(user.displayAvatarURL())
      .addFields(fields)
      .setFooter({ text: "Bot malicieux", iconURL: interaction.client.user.displayAvatarURL() })

    // Envoi de l'embed
    if (interaction.channel) {
      await interaction.channel.send({ embeds: [embed] });
      await interaction.reply({ content: "Profil affiché", flags: MessageFlags.Ephemeral });
    } else {
      await interaction.reply({ embeds: [embed] });
    }
  },
};