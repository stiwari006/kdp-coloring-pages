import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'KDP Coloring Pages AI',
  description: 'Generate Amazon KDP-compliant coloring pages with AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
