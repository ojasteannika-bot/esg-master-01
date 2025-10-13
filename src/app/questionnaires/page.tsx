import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Questionnaires",
  description: "List of available questionnaires/sections",
};

type Section = { code: string; title: string; href: string; note?: string };

const SECTIONS: Section[] = [
  { code: "A",  title: "Section A — Company basics",      href: "/questionnaires/vsme/a",  note: "DEMO" },
  { code: "B",  title: "Section B — Environmental",       href: "/questionnaires/vsme/b",  note: "DEMO" },
  { code: "B1", title: "Section B1 — Operational metrics",href: "/questionnaires/vsme/b1" },
];

export default function Page() {
  return (
    <div className="space-y-4">
      {/* UUS PÄIS (ainus) */}
      <header
        className="mb-6"
        style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "space-between" }}
      >
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em" }}>Questionnaires</h1>
          <p className="text-[--color-text-muted]" style={{ marginTop: 4 }}>
            Choose a section to open its questionnaire.
          </p>
        </div>
        <a href="/get-report" className="btn btn-primary">Generate report</a>
      </header>

      {/* KAARDID */}
      <div className="grid gap-4 sm:grid-cols-2">
        {SECTIONS.map((s) => (
          <Card key={s.code} className="flex items-stretch justify-between">
            <div className="flex-1">
              <CardHeader
                title={
                  <div className="flex items-center gap-2">
                    <span>{s.title}</span>
                    {s.note ? <span className="q-badge">{s.note}</span> : null}
                  </div>
                }
              />
              <CardBody>
                <div className="text-sm text-[--color-text-muted]">Code: {s.code}</div>
              </CardBody>
            </div>
            <div className="p-4">
              <Button href={s.href} size="sm" variant="primary">Open</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
