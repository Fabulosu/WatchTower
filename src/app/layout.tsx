import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/session-provider";
import { Roboto } from 'next/font/google'

const roboto = Roboto({
  weight: ['100', '300', '400', '700'],
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: "WatchTower",
  description: "WatchTower",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${roboto.className} antialised bg-[#131a26]`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
