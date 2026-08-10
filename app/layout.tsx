import type { Metadata } from "next";
import { Roboto_Mono } from "next/font/google";
import "./globals.css";
import Cursor from "@/components/Cursor";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";


const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Neealaksh",
  description: "Know about me, my work and my interests.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${robotoMono.className} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Cursor />
        <SmoothScrollProvider>
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
