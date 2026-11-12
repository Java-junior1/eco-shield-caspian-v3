import type { Metadata, Viewport } from "next";
import { Onest, Unbounded } from "next/font/google";
import "./globals.css";

const onest = Onest({ subsets: ["latin", "cyrillic"], variable: "--font-body", display: "swap" });
const unbounded = Unbounded({ subsets: ["latin", "cyrillic"], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  title: "Эко-Щит Каспия — ИИ-система раннего предупреждения для ООПТ",
  description:
    "Объединяем данные со спутников, датчиков и акустических буёв, чтобы защитить природу Каспийского моря от браконьерства и загрязнений.",
  openGraph: {
    title: "Эко-Щит Каспия",
    description: "ИИ-система раннего предупреждения для дельтовых и морских ООПТ",
    type: "website",
    locale: "ru_RU",
  },
};

export const viewport: Viewport = {
  themeColor: "#050E1F",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${onest.variable} ${unbounded.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
