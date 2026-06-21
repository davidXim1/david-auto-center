import os from "node:os";
import type { CompanySettings } from "@/lib/types";

function cleanOrigin(origin: string) {
  return origin.replace(/\/+$/, "");
}

function isLoopbackOrigin(origin: string) {
  try {
    const hostname = new URL(origin).hostname;
    return hostname === "localhost" || hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

function validConfiguredOrigin(origin?: string) {
  if (!origin) return "";
  const cleaned = cleanOrigin(origin.trim());
  try {
    const url = new URL(cleaned);
    if (!["http:", "https:"].includes(url.protocol)) return "";
    if (isLoopbackOrigin(cleaned)) return "";
    return cleaned;
  } catch {
    return "";
  }
}

function getLocalNetworkIp() {
  const interfaces = os.networkInterfaces();
  const addresses = Object.values(interfaces)
    .flat()
    .filter((address): address is os.NetworkInterfaceInfo => Boolean(address))
    .filter((address) => address.family === "IPv4" && !address.internal)
    .map((address) => address.address);

  return (
    addresses.find((address) => address.startsWith("192.168.")) ||
    addresses.find((address) => address.startsWith("10.")) ||
    addresses.find((address) => /^172\.(1[6-9]|2\d|3[0-1])\./.test(address)) ||
    addresses[0]
  );
}

export function getSiteOrigin(settings?: Pick<CompanySettings, "publicSiteUrl">) {
  const configured = validConfiguredOrigin(settings?.publicSiteUrl) || validConfiguredOrigin(process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL);
  if (configured) {
    return configured;
  }

  const port = process.env.PORT || "3000";
  const localIp = getLocalNetworkIp();
  return localIp ? `http://${localIp}:${port}` : `http://127.0.0.1:${port}`;
}

export function getPublicCampaignUrl(settings?: Pick<CompanySettings, "publicSiteUrl">) {
  return new URL("/participar", getSiteOrigin(settings)).toString();
}
