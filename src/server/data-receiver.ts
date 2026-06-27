import express from "express";
import crypto from "crypto";
import { ButtonBuilder, EmbedBuilder } from "discord.js";
import env from "../config.js";
import { getTwitchAvatar, getTwitchStream } from "./twitch/utils.js";
import { sendEmbedToChannel } from "../utils/sendMessage.js";
import { initEventSubRenew } from "./twitch/subsManager.js";
import { getChannels, Channel } from "../utils/getChannels.js";

// ── Constantes Twitch EventSub ────────────────────────────────────────────────

const HEADERS = {
  MESSAGE_ID: "twitch-eventsub-message-id",
  TIMESTAMP: "twitch-eventsub-message-timestamp",
  SIGNATURE: "twitch-eventsub-message-signature",
  MESSAGE_TYPE: "twitch-eventsub-message-type",
} as const;

const MESSAGE_TYPE = {
  VERIFICATION: "webhook_callback_verification",
  NOTIFICATION: "notification",
  REVOCATION: "revocation",
} as const;

const HMAC_PREFIX = "sha256=";
const BROADCASTER_LOGIN = "romain_roro__";
const BROADCASTER_ID = "486250699";

// ── HMAC ──────────────────────────────────────────────────────────────────────

function buildHmacMessage(req: express.Request): string {
  return (
    req.headers[HEADERS.MESSAGE_ID] +
    req.headers[HEADERS.TIMESTAMP] +
    req.body.toString()
  );
}

function computeHmac(secret: string, message: string): string {
  return HMAC_PREFIX + crypto.createHmac("sha256", secret).update(message).digest("hex");
}

function verifySignature(req: express.Request): boolean {
  const expected = computeHmac(env.TWITCH_SECRET, buildHmacMessage(req));
  const received = req.headers[HEADERS.SIGNATURE] as string;
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(received));
  } catch {
    return false;
  }
}

// ── Handlers par type de message ──────────────────────────────────────────────

async function handleNotification(notification: any, res: express.Response) {
  const { type } = notification.subscription;
  console.log(`Event type: ${type}`);

  if (type !== "stream.online") {
    return res.sendStatus(204);
  }

  const { broadcaster_user_id } = notification.event;

  const [avatar, streamData] = await Promise.all([
    getTwitchAvatar(broadcaster_user_id),
    getTwitchStream(broadcaster_user_id),
  ]);

  console.log(streamData);

  const streamInfo = (streamData as any)?.data?.[0];
  if (!streamInfo) return res.sendStatus(204);

  const embed: EmbedBuilder = new EmbedBuilder()
    .setAuthor({ name: `${BROADCASTER_LOGIN} est en direct sur Twitch !`, iconURL: avatar })
    .setTitle(streamInfo.title)
    .setURL(`https://www.twitch.tv/${BROADCASTER_LOGIN}`)
    .setColor("#9146FF")
    .setImage(streamInfo.thumbnail_url.replace("{width}", "1280").replace("{height}", "720"))
    .setDescription("Rejoignez-le dès maintenant pour remplir son stream de malices !")
    .addFields(
      { name: "Jeu", value: streamInfo.game_name || "Inconnu", inline: true },
      { name: "Viewers", value: streamInfo.viewer_count.toString(), inline: true }
    );

  const button = new ButtonBuilder()
    .setLabel("Regarder le stream")
    .setStyle(5)
    .setURL(`https://www.twitch.tv/${BROADCASTER_LOGIN}`);

  await sendEmbedToChannel(
    getChannels(Channel.NOTIFICATIONS_LIVE),
    embed,
    `<:Twitch:1441846410801578117> @everyone **${BROADCASTER_LOGIN} est maintenant en direct sur Twitch !** <:Twitch:1441846410801578117>`,
    button
  );

  res.sendStatus(204);
}

function handleVerification(notification: any, res: express.Response) {
  res.set("Content-Type", "text/plain").status(200).send(notification.challenge);
}

function handleRevocation(notification: any, res: express.Response) {
  const { type, status, condition } = notification.subscription;
  console.log(`${type} révoqué — raison: ${status}`);
  console.log("Condition:", JSON.stringify(condition, null, 2));
  res.sendStatus(204);
}

// ── Route principale ──────────────────────────────────────────────────────────

async function eventSubHandler(req: express.Request, res: express.Response) {
  if (!verifySignature(req)) {
    console.warn("Signature invalide — requête rejetée.");
    return res.sendStatus(403);
  }

  const notification = JSON.parse(req.body.toString());
  const messageType = req.headers[HEADERS.MESSAGE_TYPE];

  switch (messageType) {
    case MESSAGE_TYPE.NOTIFICATION:
      return handleNotification(notification, res);
    case MESSAGE_TYPE.VERIFICATION:
      return handleVerification(notification, res);
    case MESSAGE_TYPE.REVOCATION:
      return handleRevocation(notification, res);
    default:
      console.warn(`Type de message inconnu : ${messageType}`);
      return res.sendStatus(204);
  }
}

// ── Initialisation du serveur ─────────────────────────────────────────────────

export const listen = () => {
  initEventSubRenew();

  const app: express.Application = express();
  app.use(express.raw({ type: "application/json" }));
  app.post("/twitch/eventsub", eventSubHandler);
  app.get("/", (req: express.Request, res: express.Response) => {
    res.json({ health: "Ok" });
  })

  app.listen(3000, () => {
    console.log("Serveur EventSub en écoute sur le port 3000");
  });
};