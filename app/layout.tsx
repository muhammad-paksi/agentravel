import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import LoadingIndicator from "@/components/views/loading-indicator";
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "SITRAVEL",
  description: "Your travel dashboard",
  icons: {
    icon: "/img/logo.svg", // ← Ini akan jadi favicon
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // suppressHydrationWarning meredam perbedaan kecil HTML saat hydrate
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <LoadingIndicator />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          // ini yang membuat style="color-scheme" di-render server
          enableColorScheme
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
