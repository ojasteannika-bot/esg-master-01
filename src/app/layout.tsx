// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import Nav from '@/components/Nav';

export const metadata: Metadata = {
  title: 'ESG-MASTER-01',
  description: 'ESGLITE-01 prototype',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900">
        <Nav />
        <main className="container mx-auto px-3 py-4">
          {children}
        </main>
      </body>
    </html>
  );
}
