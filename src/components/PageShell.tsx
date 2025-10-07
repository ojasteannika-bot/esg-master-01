import React from "react";
export default function PageShell({ title, children }:{ title:string; children:React.ReactNode }) {
  return (
    <main className="container py-10">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <div className="mt-6">{children}</div>
    </main>
  );
}
