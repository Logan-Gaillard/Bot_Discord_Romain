import { User } from "discord.js";
import { createCanvas, loadImage } from "canvas";
import fs from "fs";

export const makeWelcomeImage = async (user: User) => {
  const canvas = createCanvas(700, 250);
  const ctx = canvas.getContext("2d");

  // Texte de bienvenue
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "25px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(
    "Bienvenue\n" + user.displayName,
    canvas.width / 2,
    canvas.height / 2 + 35
  );

  // Dessiner l'avatar et l'arrondir
  const avatar = await loadImage(user.displayAvatarURL({ extension: "png" }));
  let avatarSize = 130;

  ctx.save();

  ctx.beginPath();
  ctx.arc(
    canvas.width / 2 - avatarSize,
    canvas.height / 2 - 25,
    avatarSize / 2,
    0,
    Math.PI * 2
  );
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(
    avatar,
    canvas.width / 2 - avatarSize / 2,
    canvas.height / 2 - avatarSize / 2 - 25,
    avatarSize,
    avatarSize
  );
  ctx.restore();

  //Dessiner une image préenregistrée
  const imageRight = await loadImage("./src/imgs/test.png");

  const canvasW = (imageRight.width / imageRight.height) * 250;
  const canvasH = canvas.height;

  ctx.drawImage(
    imageRight,
    canvas.width - canvasW,
    0,
    canvasW,
    canvasH // zone où dessiner dans le canvas
  );

  const randomId = Math.random().toString(36).substring(2, 15);
  const outPath = `./tmp/${randomId}.png`;

  const buf: Buffer = canvas.toBuffer();
  try {
    await fs.promises.mkdir("./tmp", { recursive: true });
    await fs.promises.writeFile(outPath, buf);
  } catch (err) {
    console.error("Failed to write welcome image:", err);
    throw err;
  }

  return outPath;
};
