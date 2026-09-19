import "./globals.css";

export const metadata = {
  title: "Nova Store — Next.js + Sentry Demo",
  description: "Mini tienda con dos bugs intencionales para practicar con Sentry",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
