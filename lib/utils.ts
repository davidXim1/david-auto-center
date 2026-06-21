import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function whatsappUrl(phoneDigits: string, message: string) {
  return `https://wa.me/${phoneDigits}?text=${encodeURIComponent(message)}`;
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
}

export function generatePrizeCode(year = new Date().getFullYear()) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const suffix = Array.from({ length: 5 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
  return `DAC-${year}-${suffix}`;
}

export function publicCampaignUrl(origin = process.env.NEXT_PUBLIC_SITE_URL || "http://127.0.0.1:3000") {
  return new URL("/participar", origin).toString();
}

export function campaignQrPayload(_slug: string) {
  return publicCampaignUrl();
}
