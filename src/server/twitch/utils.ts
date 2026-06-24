import { getAccessToken } from "./token.js";
import fetch from "node-fetch";
import env from "../../config.js";

export async function getTwitchProfile(userId: string) {
  const token = await getAccessToken();

  const res = await fetch(`https://api.twitch.tv/helix/users?id=${userId}`, {
    headers: {
      "Client-ID": env.TWITCH_CLIENT_ID,
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  return data;
}

export async function getTwitchStream(userId: string) {
  const token = await getAccessToken();
  const res = await fetch(
    `https://api.twitch.tv/helix/streams?user_id=${userId}`,
    {
      headers: {
        "Client-ID": env.TWITCH_CLIENT_ID,
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const data = await res.json();
  return data;
}

export async function getTwitchAvatar(userId: string) {
  const profile = await getTwitchProfile(userId);
  return profile.data[0].profile_image_url;
}
