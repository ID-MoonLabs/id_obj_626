import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { BaseUIProvider } from "@/lib/baseui-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "General Agent",
  description: "General Agent",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <BaseUIProvider>
          {children}
        </BaseUIProvider>
      </body>
    </html>
  );
}
