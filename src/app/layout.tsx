import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BookLeaf Publishing - Author Portal",
  description: "Author Support & Communication Portal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
