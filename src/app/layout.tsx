import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster"
import Header from "@/components/Header";
import { AppProvider } from "@/contexts/AppContext";
import { GlobalLoading } from "@/components/GlobalLoading";
import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Futebol Stats",
  description: "Aplicativo para gerenciamento de estatísticas de futebol",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-poppins bg-gray-900 text-white min-h-screen flex flex-col`}
      >
        <AuthProvider>
          <AppProvider>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-1 container mx-auto px-4 py-6 md:py-8 lg:py-12">
                {children}
              </main>
            </div>
            <Toaster />
            <GlobalLoading />
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}