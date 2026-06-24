import { User } from "discord.js";
import { createCanvas, loadImage } from "canvas";
import fs from "fs";

export const makeWelcomeImage = async (user: User) => {
  const canvas = createCanvas(1000, 500);
  const ctx = canvas.getContext("2d");

  const imageBackground = await loadImage("./src/imgs/welcome.png");
  ctx.drawImage(imageBackground, 0, 0, canvas.width, canvas.height);

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const avatarSize = 180;
  const avatarX = cx - avatarSize / 2;
  const avatarY = cy - avatarSize / 2 - 50;
  const avatarCX = avatarX + avatarSize / 2;
  const avatarCY = avatarY + avatarSize / 2;
  const avatarR = avatarSize / 2;

  // --- Halo ambiant ---
  const halo = ctx.createRadialGradient(avatarCX, avatarCY, avatarR * 0.6, avatarCX, avatarCY, avatarR * 2.5);
  halo.addColorStop(0, "rgba(160, 80, 255, 0.5)");
  halo.addColorStop(0.5, "rgba(80, 40, 200, 0.28)");
  halo.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.beginPath();
  ctx.arc(avatarCX, avatarCY, avatarR * 2.5, 0, Math.PI * 2);
  ctx.fillStyle = halo;
  ctx.fill();

  // --- Fond circulaire fallback (avatar transparent) ---
  const bgGrad = ctx.createRadialGradient(avatarCX, avatarCY, 0, avatarCX, avatarCY, avatarR);
  bgGrad.addColorStop(0, "rgba(30, 10, 60, 0.85)");
  bgGrad.addColorStop(1, "rgba(10, 5, 30, 0.6)");
  ctx.beginPath();
  ctx.arc(avatarCX, avatarCY, avatarR, 0, Math.PI * 2);
  ctx.fillStyle = bgGrad;
  ctx.fill();

  // --- Avatar clippé ---
  const avatar = await loadImage(user.displayAvatarURL({ extension: "png", size: 256 }));
  ctx.save();
  ctx.beginPath();
  ctx.arc(avatarCX, avatarCY, avatarR, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
  ctx.restore();

  // --- Ring néon — 3 passes ---
  ctx.save();
  ctx.beginPath();
  ctx.arc(avatarCX, avatarCY, avatarR + 6, 0, Math.PI * 2);
  ctx.shadowColor = "#bf5fff";
  ctx.shadowBlur = 40;
  ctx.strokeStyle = "rgba(191, 95, 255, 0.0)";
  ctx.lineWidth = 8;
  ctx.stroke();
  ctx.restore();

  ctx.save();
  const ringGrad = ctx.createLinearGradient(avatarCX - avatarR, avatarCY, avatarCX + avatarR, avatarCY);
  ringGrad.addColorStop(0, "#7c3aed");
  ringGrad.addColorStop(0.35, "#a78bfa");
  ringGrad.addColorStop(0.65, "#60a5fa");
  ringGrad.addColorStop(1, "#7c3aed");
  ctx.shadowColor = "#a78bfa";
  ctx.shadowBlur = 22;
  ctx.beginPath();
  ctx.arc(avatarCX, avatarCY, avatarR + 5, 0, Math.PI * 2);
  ctx.strokeStyle = ringGrad;
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.arc(avatarCX, avatarCY, avatarR + 5, 0, Math.PI * 2);
  ctx.shadowColor = "#ffffff";
  ctx.shadowBlur = 8;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  // --- Helpers ---
  const hexToRgb = (hex: string): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
  };

  // Réduit la font size jusqu'à ce que le texte rentre dans maxWidth
  const fitFont = (text: string, maxWidth: number, baseSizePx: number, minSizePx = 18): string => {
    let size = baseSizePx;
    ctx.font = `bold ${size}px sans-serif`;
    while (ctx.measureText(text).width > maxWidth && size > minSizePx) {
      size -= 1;
      ctx.font = `bold ${size}px sans-serif`;
    }
    return `bold ${size}px sans-serif`;
  };

  const drawNeonText = (
    text: string,
    y: number,
    font: string,
    glowColor: string,
    gradStops: { pos: number; color: string }[]
  ) => {
    ctx.font = font;
    const textWidth = ctx.measureText(text).width + 80;

    // Glow — 3 passes de blur décroissant
    ctx.save();
    ctx.font = font;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    const glowLayers = [
      { blur: 30, alpha: 0.5  },
      { blur: 16, alpha: 0.65 },
      { blur: 8,  alpha: 0.8  },
    ];
    for (const layer of glowLayers) {
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = layer.blur;
      ctx.fillStyle = `rgba(${hexToRgb(glowColor)}, ${layer.alpha})`;
      ctx.fillText(text, cx, y);
    }
    ctx.restore();

    // Texte principal avec dégradé
    ctx.save();
    ctx.font = font;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    const grad = ctx.createLinearGradient(cx - textWidth / 2, 0, cx + textWidth / 2, 0);
    for (const stop of gradStops) grad.addColorStop(stop.pos, stop.color);
    ctx.fillStyle = grad;
    ctx.fillText(text, cx, y);
    ctx.restore();
  };

  // --- Texte ---
  const maxTextWidth = canvas.width - 100; // 50px de marge de chaque côté
  const textY = avatarY + avatarSize + 18;

  // "Bienvenue" — taille fixe, ne risque pas de déborder
  const welcomeFont = "bold 34px sans-serif";

  // Pseudo — réduit automatiquement si trop long
  const nameFont = fitFont(user.displayName, maxTextWidth, 46);

  drawNeonText(
    "Bienvenue",
    textY,
    welcomeFont,
    "#818cf8",
    [
      { pos: 0,   color: "#c7d2fe" },
      { pos: 0.5, color: "#ffffff" },
      { pos: 1,   color: "#a5b4fc" },
    ]
  );

  drawNeonText(
    user.displayName,
    textY + 42,
    nameFont,
    "#c084fc",
    [
      { pos: 0,    color: "#7c3aed" },
      { pos: 0.05, color: "#d0a3ff" },
      { pos: 0.3,  color: "#e9d5ff" },
      { pos: 0.55, color: "#ffffff" },
      { pos: 0.75, color: "#e9d5ff" },
      { pos: 0.95, color: "#d0a3ff" },
      { pos: 1,    color: "#7c3aed" },
    ]
  );

  // --- Sauvegarde ---
  const randomId = Math.random().toString(36).substring(2, 15);
  const outPath = `./tmp/${randomId}.png`;
  await fs.promises.mkdir("./tmp", { recursive: true });
  await fs.promises.writeFile(outPath, canvas.toBuffer());

  return outPath;
};