import "./globals.css";
import { Inter, Playfair_Display } from "next/font/google";
import Navbar from "@/components/navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["500", "600", "700"],
});

export const metadata = {
  description: "Mental Health Platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      
      <body className={`${inter.variable} ${playfair.variable}`}>
        <Navbar></Navbar>
        {children}
      </body>
    </html>
  );
}
