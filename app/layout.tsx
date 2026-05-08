import type { Metadata } from "next";
import "./globals.css";

import NavBar from "@/app/ui/navbar/navbar";

export const metadata: Metadata = {
  title: {
    template: "%s | SoloStream",
    default: "SoloStream",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <NavBar />
        {children}
      </body>
    </html>
  );
}
