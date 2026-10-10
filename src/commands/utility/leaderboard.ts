import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  MessageFlags,
  escapeMarkdown
} from "discord.js";
import { getGuildLeaderboard } from "../../services/server/users.js";
import { calculateLevel } from "../../services/utils.js";

const getRankIcon = (index: number) => ["🥇", "🥈", "🥉"][index] || `**${index + 1}. **`;

export default {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Top 10 des joueurs ayant le plus d'expérience"),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId || !interaction.guild) return;

    const users = await getGuildLeaderboard(interaction.guildId, 10);

    if (!users || users.length === 0) {
      return interaction.reply({
        content: "Aucun classement disponible.",
        flags: MessageFlags.Ephemeral
      });
    }

    const userIds = users.map(u => u.userId);
    const members = await interaction.guild.members.fetch({ user: userIds });

    const leaderboardText = users.map((u, i) => {
      const member = members.get(u.userId);
      const displayName = member ? escapeMarkdown(member.displayName) : escapeMarkdown(u.name);
      return `${getRankIcon(i)} **${displayName}** - Lvl **${calculateLevel(u.xp)}** (${u.xp} XP)`;
    }).join("\n\n");

    const embed = new EmbedBuilder()
      .setTitle("🏆 Classement du serveur")
      .setThumbnail(interaction.guild.iconURL() ?? null)
      embed.setColor("#dada00")
      .setDescription(leaderboardText)
      .setFooter({ text: "Bot malicieux", iconURL: interaction.client.user.displayAvatarURL() })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};