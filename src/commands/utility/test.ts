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
  devOnly: true,

  async execute(interaction: ChatInputCommandInteraction) {
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
