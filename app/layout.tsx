import type { Metadata, Viewport } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store";

const lexend = Lexend({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

export const metadata: Metadata = {
  title: { default: "Rumbo | Guía del Gran Buenos Aires", template: "%s | Rumbo" },
  description: "Atracciones, eventos, gastronomía, alojamiento y cómo llegar desde Ezeiza y Aeroparque. La guía del Gran Buenos Aires que funciona con o sin señal.",
};

export const viewport: Viewport = {
  themeColor: "#1f6f94",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={lexend.className}>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
