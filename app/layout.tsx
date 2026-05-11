import type { Metadata } from "next";

import "./globals.css";

import { Toaster } from "sonner";

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
        <Toaster
          className="toast-container"
          toastOptions={{
            unstyled: true,
            classNames: {
              toast: "toast",
              success: "toast-success",
              warning: "toast-warning",
              error: "toast-danger",
            },
          }}
        />
      </body>
    </html>
  );
}
