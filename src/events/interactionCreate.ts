import {
  CommandInteraction,
  Events,
  Interaction,
  MessageFlags,
} from "discord.js";

import env from "../config.js";

export default {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.error(`Aucun commande trouvée pour ${interaction.commandName}`);
      return;
    }

    const DEV_IDS = env.DEV_IDS?.split(",") ?? [];

    if (command.devOnly && !DEV_IDS.includes(interaction.user.id)) {
        return interaction.reply({
            content: "Cette commande est réservée aux développeurs du bot.",
            flags: MessageFlags.Ephemeral,
        });
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content:
            "Il y a eu une erreur lors de l'exécution de cette commande !",
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content:
            "Il y a eu une erreur lors de l'exécution de cette commande !",
          ephemeral: true,
        });
      }
    }
  },
};
