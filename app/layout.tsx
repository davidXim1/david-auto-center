import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "David Auto Center Club",
  description: "Clube de beneficios, roleta da sorte e fidelizacao da David Auto Center."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
