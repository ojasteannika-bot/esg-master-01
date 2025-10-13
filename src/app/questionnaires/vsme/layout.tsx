'use client';

import Link from "next/link";
import React from "react";
import ProjectPicker from "@/components/ProjectPicker";

export default function VsmeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">VSME sections</h1>
        <ProjectPicker />
      </div>
      <nav className="mb-6 text-sm">
        <Link href="/questionnaires" className="text-blue-600 hover:underline">
          ← Back
        </Link>
      </nav>
      {children}
    </div>
  );
}
