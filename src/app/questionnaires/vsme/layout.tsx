// src/app/questionnaires/vsme/layout.tsx
import React from 'react';
import Link from 'next/link';
import ProjectPicker from '@/components/ProjectPicker';

export default function VsmeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      {/* Kohalik tööriistariba – paneme siia ProjectPickeri igaks juhuks */}
      <div className="border-b">
        <div className="container mx-auto flex items-center justify-between p-3">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-semibold">ESG-MASTER-01</Link>
            <nav className="hidden sm:flex items-center gap-3 text-sm text-slate-600">
              <Link href="/questionnaires">Questionnaires</Link>
              <Link href="/questionnaires/vsme/nodes">VSME sections</Link>
            </nav>
          </div>
          <div className="shrink-0">
            <ProjectPicker />
          </div>
        </div>
      </div>

      {/* Page content with side menu (existing design left “Sections” etc – kui sul on selline) */}
      <div>{children}</div>
    </div>
  );
}
