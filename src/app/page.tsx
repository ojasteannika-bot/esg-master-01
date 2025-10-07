import Link from "next/link";
import PageShell from "@/components/PageShell";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Stat from "@/components/Stat";

export default function Page() {
  return (
    <PageShell title="ESG-MASTER-01">
      {/* Banner */}
      <Card className="bg-brand-500 text-white p-4">
        <div className="text-sm">Tailwind OK — ready for UI</div>
      </Card>

      {/* KPIs */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Score" value="74%" hint="prototype" />
        <Stat label="Emissions" value="129 tCO₂e" hint="Scope 1" />
        <Stat label="Energy" value="82,837 kWh" />
        <Stat label="Suppliers" value={12} />
      </div>

      {/* Actions */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="p-5">
          <div className="text-slate-900 font-medium">Quick wizard</div>
          <p className="mt-1 text-sm text-slate-600">
            Start with VSME sections A/B/B1
          </p>
          <Link href="/wizard" className="inline-block mt-4">
            <Button>Open wizard</Button>
          </Link>
        </Card>

        <Card className="p-5">
          <div className="text-slate-900 font-medium">Preview / PDF</div>
          <p className="mt-1 text-sm text-slate-600">
            Generate a draft report
          </p>
          <Link href="/preview" className="inline-block mt-4">
            <Button variant="ghost">Open preview</Button>
          </Link>
        </Card>

        <Card className="p-5">
          <div className="text-slate-900 font-medium">Audit trail</div>
          <p className="mt-1 text-sm text-slate-600">
            Track changes & events
          </p>
          <Link href="/audit" className="inline-block mt-4">
            <Button variant="ghost">View log</Button>
          </Link>
        </Card>
      </div>
    </PageShell>
  );
}
