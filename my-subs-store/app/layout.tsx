// app/layout.tsx
import "./globals.css";
import Topbar from "./components/layout/Topbar";
import Header from "./components/layout/Header";
import Navbar from "./components/layout/Navbar";

export const metadata = {
  title: "SubsStore BD",
  description: "Digital Subscriptions in Bangladesh",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}