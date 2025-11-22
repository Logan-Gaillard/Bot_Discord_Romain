import { Client, Events } from "discord.js";

export default {
  name: Events.ClientReady,
  once: true,
  execute(client: Client) {
    console.log(`Connecté en tant que ${client.user.tag}`);
    //client.user.setAvatar("./src/imgs/avatar.png");
  },
};
