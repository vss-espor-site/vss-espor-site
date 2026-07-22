import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "PUBG Mobile e-Spor Toplulugu",
  description: "Resmi PUBG Mobile e-spor takim ve toplulugu web sitesi.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className="dark">
      <body className="min-h-screen bg-bg bg-scanlines">
        <Providers>
          <Navbar />
          <main className="mx-auto min-h-[70vh] max-w-6xl px-4 py-10">{children}</main>
          <Footer />
          <ChatWidget />
        </Providers>
      </body>
    </html>
  );
}
