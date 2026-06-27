import fetch from "node-fetch";
import env from "../../config.js";

const CLIENT_ID = env.TWITCH_CLIENT_ID;
const CLIENT_SECRET = env.TWITCH_CLIENT_SECRET;
let accessToken = null;
let tokenExpiry = 0;

export async function getAccessToken() {
  const now = Date.now();
  if (accessToken && now < tokenExpiry) {
    return accessToken; // token encore valide
  }

  console.log(CLIENT_ID, CLIENT_SECRET);

  const res = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials`,
    {
      method: "POST",
    }
  );
  const data = await res.json() as any;

  accessToken = data.access_token;
  tokenExpiry = now + data.expires_in * 1000 - 60000; // expire 1 min avant pour être sûr
  return accessToken;
}
