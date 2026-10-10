import { Events, VoiceState } from "discord.js";
import userProfile from "../services/user/userProfile.js";

const voiceSessions = new Map<string, number>();

export default {
  name: Events.VoiceStateUpdate,
  async execute(oldState: VoiceState, newState: VoiceState) {
    if (newState.member?.user.bot) return;

    const userId = newState.member!.id;
    const isAfkOrMuted = 
      newState.channelId === newState.guild.afkChannelId || 
      newState.selfDeaf || 
      newState.selfMute;

    if (newState.channelId && !isAfkOrMuted && !voiceSessions.has(userId)) {
      voiceSessions.set(userId, Date.now());
    } 
    else if ((!newState.channelId || isAfkOrMuted) && voiceSessions.has(userId)) {
      const joinTime = voiceSessions.get(userId)!;
      voiceSessions.delete(userId);

      // 1 minute = 60000ms. On donne par exemple 2 XP par minute passée.
      const minutesSpent = Math.floor((Date.now() - joinTime) / 60000); 
      const xpEarned = minutesSpent * 2; 

      if (xpEarned > 0) {
        const profile = await userProfile(newState.member!.user, newState.guild.id);
        await profile.dataFunction.addXP(xpEarned, "vocale");
      }
    }
  },
};