import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  MessageFlags,
  escapeMarkdown
} from "discord.js";
import { getGuildLeaderboard } from "../../services/server/users.js";

function calculateLevel(xp: number): number {
  return Math.floor((-60 + Math.sqrt(60 ** 2 + 4 * 30 * xp)) / (2 * 30));
}

const getRankIcon = (index: number) => ["🥇", "🥈", "🥉"][index] || `**${index + 1}.**`;

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

    // Récupère les membres du serveur pour avoir leurs pseudos locaux
    const userIds = users.map(u => u.userId);
    const members = await interaction.guild.members.fetch({ user: userIds });

    const embed = new EmbedBuilder()
      .setTitle(`🏆 Classement du serveur`)
      .setThumbnail(interaction.guild.iconURL() ?? null)
      .setColor("#2b2d31")
      .addFields(
        { name: "Rang", value: users.map((_, i) => getRankIcon(i)).join("\n\n"), inline: true },
        { 
          name: "Joueur", 
          value: users.map(u => {
            const member = members.get(u.userId);
            const name = member ? `<@${u.userId}>` : u.name; 
            return `**${name}**`;
          }).join("\n\n"), 
          inline: true 
        },
        { name: "Niveau (XP)", value: users.map(u => `Lvl **${calculateLevel(u.xp)}** (${u.xp})`).join("\n\n"), inline: true }
      )
      .setFooter({ text: "Made by Octokling" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};