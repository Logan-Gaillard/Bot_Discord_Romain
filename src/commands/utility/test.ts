import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
  MessageFlags,
  Events,
  GuildMember,
} from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("test")
    .setDescription("Test d'une fonctionnalité"),

  async execute(interaction: ChatInputCommandInteraction) {
    // if (interaction.channel.guild.id !== "1437881720421744662") return;
    await interaction.reply({
      content: "Test en cours...",
      flags: MessageFlags.Ephemeral,
    });

    await interaction.client.emit(
      Events.GuildMemberAdd,
      interaction.member as GuildMember
    );

    await interaction.editReply({
      content: "Test terminé !",
    });
  },
};
