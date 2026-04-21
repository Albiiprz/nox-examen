import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NOX Exámenes",
  description: "Plataforma de exámenes tipo test para profesorado y alumnado",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
