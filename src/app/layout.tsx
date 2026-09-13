import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { getCurrentUser } from "@/lib/session";
import { Toaster } from "sonner";
import "./globals.css";

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: "BlueNex Labs | Korean skincare & cosmetic ingredients in Canada",
    template: "%s | BlueNex Labs",
  },
  description:
    "Canadian shop for high-quality Korean skincare and cosmetic ingredients. Ships domestically with Interac e-Transfer checkout.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  return (
    <html
      lang="en-CA"
      className={`${sans.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-navy-50 font-sans antialiased">
        <Header user={user} />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
