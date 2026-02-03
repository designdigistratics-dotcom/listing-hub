import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";
import { GoogleOAuthProvider } from "@react-oauth/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ListingHub - Find Your Dream Property",
  description: "ListingHub is a premium real estate platform connecting buyers with verified property listings across India.",
  keywords: ["real estate", "property", "apartments", "villas", "India", "buy property"],
  authors: [{ name: "ListingHub" }],
  openGraph: {
    title: "ListingHub - Find Your Dream Property",
    description: "Premium real estate platform connecting buyers with verified property listings",
    type: "website",
    siteName: "ListingHub",
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
        className={`${inter.variable} font-sans antialiased bg-white text-slate-950`}
      >
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
          <AuthProvider>
            {children}
            <Toaster position="top-center" richColors />
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
