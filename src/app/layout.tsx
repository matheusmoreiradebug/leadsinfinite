import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Infinite Leads — Dashboard",
  description: "Sistema de rastreamento de leads Infinite Móveis",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-[#0f1117] text-slate-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
