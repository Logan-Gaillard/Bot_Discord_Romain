import {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("message-reseaux")
    .setDescription(
      "Envoie un message sur le serveur souhaité des réseaux sociaux de romain_roro__"
    )
    .addChannelOption((option) =>
      option
        .setName("salon")
        .setDescription("Salon où envoyer le message")
        .setRequired(true)
    )

    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const embed = new EmbedBuilder();
    embed.setTitle("📹  Retrouvez Romain_roro sur ces réseaux");
    embed.setDescription(
      "Suivez-le pour ne pas manquer ses derniers contenus !"
    );
    embed.setColor("#ffff00");
    embed.addFields(
      {
        name: "<:Twitch:1441846410801578117> **Twitch**",
        value: "https://www.twitch.tv/romain_roro__/",
      },
      {
        name: "<:tiktok:1441846401788149892> **TikTok**",
        value: "https://www.tiktok.com/@romain_roro__/",
      },
      {
        name: "<:instagram:1441846391348396062> **Instagram**",
        value: "https://www.instagram.com/romain_roro_/",
      },
      {
        name: "<:YouTube:1441846420905791559> **YouTube**",
        value: "https://www.youtube.com/@Romain_roroo/",
      }
    );
    embed.setFooter({
      text: "💛 Merci pour votre soutien et à bientôt !",
    });
    embed.setThumbnail(
      "https://yt3.googleusercontent.com/YSxX-rdU2S_WwCtU3Xp1c_lhLAinD3o8Z_YQ8oR51lK9t4tDRzPbmaSciuDPrRhKSiNv8NoUXw=s72-c-k-c0x00ffffff-no-rj"
    );

    await interaction.reply({ content: "Message envoyé !", ephemeral: true });

    const channel = interaction.options.getChannel("salon");
    channel.send({ embeds: [embed] });
  },
};
