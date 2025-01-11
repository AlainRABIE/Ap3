import { Menubar } from "../../components/ui/Menubar";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="relative min-h-screen flex flex-col">
        <div className="flex-grow">{children}</div>
        <Menubar /> {/* Menubar en bas */}
      </body>
    </html>
  );
}
