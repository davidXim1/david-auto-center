"use client";

import { useMemo, useRef, useState } from "react";
import { Download, FileSpreadsheet, Link2, MessageCircle, QrCode } from "lucide-react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import { Button, Card } from "@/components/ui";
import type { Campaign, CompanySettings } from "@/lib/types";

type ArtFormat = "story" | "feed";

interface MarketingToolsProps {
  campaign: Campaign;
  companySettings: CompanySettings;
  campaignUrl: string;
}

function imageUrl(src: string) {
  if (src.startsWith("http")) return src;
  return `${window.location.origin}${src}`;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = imageUrl(src);
  });
}

function drawCover(ctx: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, width: number, height: number) {
  const scale = Math.max(width / image.width, height / image.height);
  const scaledWidth = image.width * scale;
  const scaledHeight = image.height * scale;
  ctx.drawImage(image, x + (width - scaledWidth) / 2, y + (height - scaledHeight) / 2, scaledWidth, scaledHeight);
}

function drawWrappedText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number, maxLines = 4) {
  const words = text.split(/\s+/).filter(Boolean);
  let line = "";
  let lineCount = 0;

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      line = word;
      y += lineHeight;
      lineCount += 1;
      if (lineCount >= maxLines - 1) break;
    } else {
      line = testLine;
    }
  }

  if (line && lineCount < maxLines) {
    ctx.fillText(line, x, y);
  }
}

function downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = filename;
  link.click();
}

export function MarketingTools({ campaign, companySettings, campaignUrl }: MarketingToolsProps) {
  const [status, setStatus] = useState("");
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const isHttps = campaignUrl.startsWith("https://");

  const whatsappText = useMemo(() => {
    return [
      `Participe da campanha ${campaign.nome} da ${companySettings.nome}!`,
      campaign.texto,
      "Cadastre seu veiculo, entre no Grupo VIP e gire a roleta para ganhar premios.",
      `Acesse: ${campaignUrl}`
    ].join("\n\n");
  }, [campaign.nome, campaign.texto, campaignUrl, companySettings.nome]);

  async function copyText(text: string, message: string) {
    try {
      await navigator.clipboard.writeText(text);
      setStatus(message);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "true");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      const copied = document.execCommand("copy");
      document.body.removeChild(textarea);
      setStatus(copied ? message : "Nao foi possivel copiar automaticamente. Selecione e copie o texto manualmente.");
    }
  }

  async function downloadArt(format: ArtFormat) {
    const qrCanvas = qrCanvasRef.current;
    if (!qrCanvas) {
      setStatus("QR Code ainda esta carregando. Tente novamente em alguns segundos.");
      return;
    }

    setStatus("Gerando arte...");

    try {
      const isStory = format === "story";
      const width = 1080;
      const height = isStory ? 1920 : 1080;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const [facade, logo] = await Promise.all([
        loadImage(companySettings.fachadaUrl),
        loadImage(companySettings.logoUrl)
      ]);

      ctx.fillStyle = "#09090b";
      ctx.fillRect(0, 0, width, height);
      drawCover(ctx, facade, 0, 0, width, height);

      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, "rgba(9,9,11,0.25)");
      gradient.addColorStop(0.52, "rgba(9,9,11,0.82)");
      gradient.addColorStop(1, "rgba(9,9,11,0.97)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      const margin = isStory ? 86 : 62;
      const logoSize = isStory ? 180 : 132;
      ctx.save();
      ctx.beginPath();
      ctx.arc(margin + logoSize / 2, margin + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(logo, margin, margin, logoSize, logoSize);
      ctx.restore();

      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(margin + logoSize / 2, margin + logoSize / 2, logoSize / 2 + 3, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = `900 ${isStory ? 86 : 58}px Arial`;
      drawWrappedText(ctx, "David Auto Center Club", margin, isStory ? 430 : 270, width - margin * 2, isStory ? 96 : 66, 2);

      ctx.fillStyle = "#f4f4f5";
      ctx.font = `700 ${isStory ? 44 : 30}px Arial`;
      drawWrappedText(ctx, campaign.nome, margin, isStory ? 650 : 420, width - margin * 2, isStory ? 58 : 42, 2);

      ctx.fillStyle = "#d71920";
      ctx.fillRect(margin, isStory ? 780 : 520, isStory ? 420 : 310, isStory ? 72 : 56);
      ctx.fillStyle = "#ffffff";
      ctx.font = `900 ${isStory ? 34 : 26}px Arial`;
      ctx.fillText("GIRE A ROLETA", margin + 28, isStory ? 827 : 557);

      ctx.fillStyle = "#ffffff";
      ctx.font = `700 ${isStory ? 42 : 30}px Arial`;
      drawWrappedText(ctx, campaign.texto, margin, isStory ? 930 : 640, width - margin * 2, isStory ? 58 : 42, 4);

      const qrSize = isStory ? 310 : 230;
      const qrX = width - margin - qrSize;
      const qrY = height - margin - qrSize;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(qrX - 22, qrY - 22, qrSize + 44, qrSize + 44);
      ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);

      ctx.fillStyle = "#ffffff";
      ctx.font = `900 ${isStory ? 38 : 28}px Arial`;
      ctx.fillText("Aponte a camera", margin, qrY + 62);
      ctx.font = `600 ${isStory ? 28 : 22}px Arial`;
      drawWrappedText(ctx, companySettings.endereco, margin, qrY + 112, qrX - margin - 44, isStory ? 38 : 30, 2);
      ctx.fillText(companySettings.whatsapp, margin, qrY + (isStory ? 212 : 178));

      downloadCanvas(canvas, `david-auto-center-${format}-${campaign.slug}.png`);
      setStatus(isStory ? "Story baixado em PNG." : "Feed baixado em PNG.");
    } catch {
      setStatus("Nao foi possivel gerar a arte. Confira se a logo e a fachada existem.");
    }
  }

  return (
    <Card id="marketing">
      <div className="mb-3 flex items-center gap-2">
        <QrCode className="text-brand-red" />
        <h2 className="text-xl font-black">Marketing e divulgacao</h2>
      </div>

      <div className="flex justify-center rounded-lg border border-zinc-200 bg-white p-4">
        <QRCodeSVG value={campaignUrl} size={176} />
      </div>

      <div className="mt-3 rounded-lg bg-zinc-50 p-3 text-xs font-bold text-zinc-600">
        Link publico: <span className="break-all text-zinc-950">{campaignUrl}</span>
      </div>

      {!isHttps ? (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-bold text-brand-red">
          Este link e local de teste. Alguns celulares e WhatsApp podem bloquear. Para clientes, use um dominio publicado com HTTPS em Configuracoes.
        </div>
      ) : null}

      <div className="mt-4 grid gap-2 text-sm">
        <Button type="button" variant="secondary" onClick={() => copyText(campaignUrl, "Link da campanha copiado.")}>
          <Link2 size={18} /> Copiar link curto
        </Button>
        <Button type="button" variant="secondary" onClick={() => downloadArt("story")}>
          <Download size={18} /> Story 1080x1920
        </Button>
        <Button type="button" variant="secondary" onClick={() => downloadArt("feed")}>
          <FileSpreadsheet size={18} /> Feed 1080x1080
        </Button>
        <Button type="button" onClick={() => copyText(whatsappText, "Texto para WhatsApp copiado.")}>
          <MessageCircle size={18} /> Texto WhatsApp
        </Button>
      </div>

      {status ? <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm font-bold text-brand-red">{status}</p> : null}
      <QRCodeCanvas ref={qrCanvasRef} value={campaignUrl} size={512} className="hidden" />
    </Card>
  );
}
