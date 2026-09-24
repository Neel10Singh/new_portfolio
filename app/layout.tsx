import type { Metadata } from "next";
import { Roboto_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Cursor from "@/components/Cursor";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";
import Navbar from "@/components/Navbar";
import LoadingScreen from "@/components/LoadingScreen";


const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

// Runs before first paint. Every page switch here is a full document load, so
// the loader would otherwise replay on each one; skip it for same-site
// navigations and back/forward, and keep it for reloads and fresh visits.
const skipLoaderScript = `(function () {
  try {
    var entry = performance.getEntriesByType("navigation")[0];
    var type = entry && entry.type;
    var internal = false;
    try {
      internal = !!document.referrer &&
        new URL(document.referrer).origin === location.origin;
    } catch (e) {}
    if (type === "back_forward" || (type === "navigate" && internal)) {
      document.documentElement.setAttribute("data-skip-loader", "");
    }
  } catch (e) {}
})();`;

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
      className={`${robotoMono.className} ${spaceGrotesk.variable} h-full antialiased`}
      // The inline script below may add data-skip-loader before hydration.
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: skipLoaderScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-white">
        <LoadingScreen />
        <Navbar/>
        <Cursor />
        <SmoothScrollProvider>
            {children}
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
