import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";

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
      <body>
        <NextTopLoader showSpinner={false} />
        {children}
        <Toaster
          position="top-right"
          gutter={12}
          containerStyle={{ top: 16, right: 16 }}
          toastOptions={{
            duration: 4000,
            style: {
              backgroundColor: "var(--surface)",
              color: "var(--text)",
              border: "1px solid var(--border)",
              padding: "12px 16px",
              fontSize: "14px",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            },
            success: {
              iconTheme: {
                primary: "var(--primary)",
                secondary: "var(--surface)",
              },
            },
            error: {
              iconTheme: { primary: "#ef4444", secondary: "#fff" },
            },
          }}
        />
      </body>
    </html>
  );
}
