import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { theme } from "@/styles/theme";

export const metadata: Metadata = {
  title: "Covo - Group Chat",
  description: "A modern group chat application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: theme.typography.fontFamily.sans }}>
        <AuthProvider>
        {children}
        </AuthProvider>
      </body>
    </html>
  );
}
