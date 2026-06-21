import Image from "next/image";
import { MapPin, MessageCircle, ShieldCheck } from "lucide-react";
import { companySettings } from "@/lib/config";
import type { CompanySettings } from "@/lib/types";
import { whatsappUrl } from "@/lib/utils";

export function BrandHeader({ settings = companySettings }: { settings?: CompanySettings }) {
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-950/95 text-white backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <a href="/" className="flex items-center gap-3">
          <Image src={settings.logoUrl} alt="Logo David Auto Center" width={48} height={48} className="rounded-full border border-white/20 object-cover" priority />
          <div>
            <p className="text-sm font-black leading-none">{settings.nome}</p>
            <p className="text-xs text-zinc-300">{settings.slogan}</p>
          </div>
        </a>
      </div>
    </header>
  );
}

export function FloatingWhatsapp({ settings = companySettings }: { settings?: CompanySettings }) {
  return (
    <a
      aria-label="Falar no WhatsApp"
      href={whatsappUrl(settings.whatsappDigits, settings.defaultWhatsappMessage)}
      className="fixed bottom-4 right-4 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-2xl"
    >
      <MessageCircle size={26} />
    </a>
  );
}

export function BusinessStrip({ settings = companySettings }: { settings?: CompanySettings }) {
  return (
    <div className="grid gap-3 border-y border-zinc-200 bg-white px-4 py-4 text-sm sm:grid-cols-3">
      <div className="flex items-center gap-2">
        <MapPin className="text-brand-red" size={18} />
        <span>{settings.endereco}</span>
      </div>
      <div className="flex items-center gap-2">
        <MessageCircle className="text-brand-red" size={18} />
        <span>{settings.whatsapp}</span>
      </div>
      <div className="flex items-center gap-2">
        <ShieldCheck className="text-brand-red" size={18} />
        <span>LGPD, codigo unico e QR Code de resgate</span>
      </div>
    </div>
  );
}
