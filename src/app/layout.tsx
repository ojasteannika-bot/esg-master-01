// src/app/layout.tsx
import './globals.css';                // Tailwindi/globaalide laadimiseks
import type { Metadata } from 'next';
import ProjectPicker from '@/components/ProjectPicker'; // või '../components/ProjectPicker' kui aliasi pole

export const metadata: Metadata = {
  title: 'ESG-MASTER-01',
  description: 'Internal prototype',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-white text-slate-900 antialiased">
        <header className="border-b">
          <div className="container mx-auto flex items-center justify-between p-3">
            <a href="/" className="font-semibold">ESG-MASTER-01</a>
            <ProjectPicker />
          </div>
        </header>

        <main className="container mx-auto p-3">
          {children}
        </main>
      </body>
    </html>
  );
}
