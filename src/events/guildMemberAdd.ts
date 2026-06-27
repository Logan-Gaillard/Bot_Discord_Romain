import { Events, GuildMember } from "discord.js";
import { makeWelcomeImage } from "../utils/imageTraitement.js";
import { getChannels, Channel } from "../utils/getChannels.js";

const randomMessages = [
  `Ce que tu ne le savais-tu pas, {user} rejoigna le serveur`,
  `Le fou du bus avait prévenu que {user} allait rappliquer`,
  `{user} rejoigna le serveur. La poubelle malicieuse le savait déjà`,
  `J'étais en train de promener mon mouton lorsque {user} se joignit à nous`,
  `Je me précipita dans les égouts afin d'accueillir {user}`,
  `{user} rejoigna le serveur. NONNNNNNN !`,
  `L'homme chenille sortit du buisson. C'était {user}`,
  `La piste que {user} suivait l'avait mené jusqu'ici, nous pouvons le féliciter.`,
  `Ce que {user} ne le savais-tu pas, une poubelle malicieuse l'attendait déjà`,
  `{user} fit son entrée. J'avais terriblement envie d'une pizza de la mama`,
  `Ce n'était en réalité pas l'électricien, mais {user} qui venait de rejoindre`,
  `Je chiais ardemment mon âme sur le trône lorsque {user} rejoigna le serveur`,
  `Le lobotomisateur sortit de nulle part. C'était {user}`,
  `{user} fit son entrée. Le lobotricien veillait déjà`,
  `J'allais me faire une citronnade au citron lorsque {user} rappligna`,
  `{user} rejoigna le serveur. "Je vais te toucher la nuit"`,
  `Je jouais aux échecs avec mon pote à la compote lorsque {user} se joignit à nous`,
  `La poubelle malicieuse était à ma poursuite quand {user} rejoigna le serveur`,
  `{user} rejoigna le serveur. La créature l'attendait de pied ferme`,
  `Je partis faire mes courses quand je sentis une présence. C'était {user}`,
  `Larry m'observait. Il savait que {user} allait rappliquer`,
]

export default {
  name: Events.GuildMemberAdd,
  async execute(member: GuildMember) {
    //if (member.guild.id !== "1437881720421744662") return;

    //Envoie d'un message de bienvenue dans le channel "general" du serveur
    const channel = member.guild.channels.cache.get(getChannels(Channel.ARRIVANTS));
    
    if (!channel || !channel.isTextBased()) return;
    let pathImage = await makeWelcomeImage(member.user);

    const randomIndex = Math.floor(Math.random() * randomMessages.length)
    const welcomeMessage = randomMessages[randomIndex].replace("{user}", `<@${member.id}>`)

    await channel.send({ content: welcomeMessage, files: [pathImage] });

    console.log(`Nouveau membre : ${member.user.tag} a rejoint le serveur ${member.guild.name}`);
  },
};
