import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/session-provider";
import { Roboto } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { Toaster } from "react-hot-toast";

const roboto = Roboto({
  weight: ['100', '300', '400', '500', '700', '900'],
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
        className={`${roboto.className} antialised bg-background`}
      >
        <AuthProvider>
          <Toaster position="bottom-right" />
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            // enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}