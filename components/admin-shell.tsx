import Link from "next/link";
import { BarChart3, CalendarCheck, Gift, Megaphone, QrCode, Settings, Shield, Trophy, Users, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { label: "Dashboard", href: "/admin", icon: BarChart3 },
  { label: "Clientes", href: "/admin#clientes", icon: Users },
  { label: "Campanhas", href: "/admin#campanhas", icon: Megaphone },
  { label: "Roletas", href: "/admin#roletas", icon: Trophy },
  { label: "Premios", href: "/admin#premios", icon: Gift },
  { label: "Agendamentos", href: "/admin#agendamentos", icon: CalendarCheck },
  { label: "Resgates", href: "/admin#resgates", icon: Shield },
  { label: "Marketing", href: "/admin#marketing", icon: QrCode },
  { label: "Configuracoes", href: "/admin#configuracoes", icon: Settings }
];

export function AdminNav() {
  return (
    <aside className="sticky top-0 hidden h-screen border-r border-zinc-200 bg-white p-4 lg:block">
      <Link href="/" className="mb-6 flex items-center gap-2 text-lg font-black">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-red text-white"><Wrench size={18} /></span>
        DAC Club
      </Link>
      <nav className="grid gap-1">
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-zinc-700 hover:bg-zinc-100",
                index === 0 && "bg-zinc-950 text-white hover:bg-zinc-900"
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function MobileAdminNav() {
  return (
    <div className="sticky top-0 z-20 flex gap-2 overflow-x-auto border-b border-zinc-200 bg-white p-3 lg:hidden">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link key={item.href} href={item.href} className="inline-flex min-w-fit items-center gap-2 rounded-lg bg-zinc-100 px-3 py-2 text-xs font-bold">
            <Icon size={16} />
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
