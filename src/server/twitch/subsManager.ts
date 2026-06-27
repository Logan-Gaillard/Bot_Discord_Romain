import fetch from "node-fetch";
import { getAccessToken } from "./token.js";
import env from "../../config.js";

const CLIENT_ID = env.TWITCH_CLIENT_ID;
const CLIENT_SECRET = env.TWITCH_CLIENT_SECRET;

async function getAllSubs() {
  const token = await getAccessToken();
  const res = await fetch(
    `https://api.twitch.tv/helix/eventsub/subscriptions`,
    {
      headers: {
        "Client-ID": CLIENT_ID,
        Authorization: `Bearer ${token}`,
      },
    }
  );
  
  const data = await res.json() as any; // ← Type forcé en any
  console.log("Récupération des EventSub :", data);
  return data;
}

async function createSub(type: string, condition: any, callback: string) { // ← Types ajoutés
  const token = await getAccessToken();

  await fetch("https://api.twitch.tv/helix/eventsub/subscriptions", {
    method: "POST",
    headers: {
      "Client-ID": CLIENT_ID,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type,
      version: "1",
      condition,
      transport: {
        method: "webhook",
        callback,
        secret: env.TWITCH_SECRET,
      },
    }),
  });

  console.log("EventSub recréé :", type);
}

export async function initEventSubRenew() {
  const subs = await getAllSubs();

  const validSubs = subs.data.filter(
    (sub: any) => sub.status === "enabled" || sub.status === "webhook_callback_verification_pending"
  );

  if (validSubs.length === 0) {
    console.log("Aucun abonnement valide, suppression et recréation...");

    // Supprimer les subs invalides d'abord
    for (const sub of subs.data) {
      await deleteSub(sub.id);
    }

    const env = process.env.ENVIRONMENT || "development";
    const callbackUrl =
      env === "production"
        ? "https://romain_bot.logangaillard.fr/twitch/eventsub"
        : "https://statue-astronaut-paragraph.ngrok-free.dev/twitch/eventsub";

    await createSub(
      "stream.online",
      { broadcaster_user_id: "1323092263" },
      callbackUrl
    );
  }
}

async function deleteSub(id: string) {
  const token = await getAccessToken();
  await fetch(`https://api.twitch.tv/helix/eventsub/subscriptions?id=${id}`, {
    method: "DELETE",
    headers: {
      "Client-ID": CLIENT_ID,
      Authorization: `Bearer ${token}`,
    },
  });
  console.log("EventSub supprimé :", id);
}

export const resetEventSub = async () => {
  const subs = await getAllSubs();

  for (const sub of subs.data) {
    const token = await getAccessToken();

    await fetch(`https://api.twitch.tv/helix/eventsub/subscriptions?id=${sub.id}`, {
      method: "DELETE",
      headers: {
        "Client-ID": CLIENT_ID,
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("EventSub supprimé :", sub.type);
  }
}