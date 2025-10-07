import Link from 'next/link';
import PageShell from '@/components/PageShell';
import Card from '@/components/Card';

export default function QuestionnairesPage() {
  return (
    <PageShell title="Questionnaires">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/questionnaires/vsme" className="block">
          <Card className="p-5 transition hover:shadow-card-hover">
            <div className="text-slate-900 font-medium">VSME</div>
            <p className="mt-1 text-sm text-slate-600">Sections A/B + B1 (dynamic)</p>
          </Card>
        </Link>
        <Card className="p-5 opacity-60">
          <div className="text-slate-900 font-medium">CSRD / ESRS</div>
          <p className="mt-1 text-sm text-slate-600">Coming soon</p>
        </Card>
        <Card className="p-5 opacity-60">
          <div className="text-slate-900 font-medium">Sector modules</div>
          <p className="mt-1 text-sm text-slate-600">Energy / Transport — coming soon</p>
        </Card>
      </div>
    </PageShell>
  );
}
