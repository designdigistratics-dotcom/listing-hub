import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Topickx - Find Your Dream Project",
  description: "Topickx is a premium real estate platform connecting buyers with verified project listings across India.",
  keywords: ["real estate", "project", "apartments", "villas", "India", "buy project", "topickx"],
  authors: [{ name: "Topickx" }],
  openGraph: {
    title: "Topickx - Find Your Dream Project",
    description: "Premium real estate platform connecting buyers with verified project listings",
    type: "website",
    siteName: "Topickx",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans antialiased bg-white text-slate-950 min-h-screen flex flex-col`}
      >
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
          <AuthProvider>
            <main className="flex-1">
              {children}
            </main>
            <Footer />
            <Toaster position="top-center" richColors />
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
