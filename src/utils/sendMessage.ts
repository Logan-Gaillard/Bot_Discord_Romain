import { ButtonBuilder, EmbedBuilder } from "@discordjs/builders";
import { ActionRowBuilder } from "discord.js";
import { client } from "../index.js";

export const sendEmbedToChannel = async (
  channelId: string,
  embed: EmbedBuilder,
  message?: string,
  button?: ButtonBuilder
) => {
  const channel = await client.channels.fetch(channelId);
  if (!channel || !channel.isTextBased()) {
    console.error(
      "Le canal spécifié est introuvable ou n'est pas un canal textuel."
    );
    return;
  }
  const components = button
    ? [new ActionRowBuilder().addComponents(button)]
    : [];
  await channel.send({
    embeds: [embed],
    content: message || "",
    components,
  });
};
