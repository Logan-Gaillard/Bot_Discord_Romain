import {
  Events,
  Message,
  MessageFlags,
} from "discord.js";
import userProfile from "../services/user/userProfile.js";

export default {
  name: Events.MessageCreate,
  async execute(message: Message) {
    try {
        if(message.author.bot) return
        const profile = await userProfile(message.author, message.guild.id);
        const lastDropXP = await profile.getLastXPDate()
        const randomXPCooldown = Math.floor(Math.random() * (90000 - 30000 + 1)) + 30000;
        const randomXP = Math.floor(Math.random() * (50 - 15 + 1))

        if(lastDropXP && Date.now() - lastDropXP.getTime() < randomXPCooldown) return // Pas d'xp
        await profile.dataFunction.addXP(randomXP)
        const xpAmount = await profile.getUserXP();

        console.log(`${message.author.username} possède maintenant ${xpAmount.xp}xp soit un level de ${xpAmount.level}`)
    } catch (error) {
      console.error(error);
    }
  },
};
