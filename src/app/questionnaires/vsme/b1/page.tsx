'use client';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Label from '@/components/ui/Label';
import Textarea from '@/components/ui/Textarea';
import Card, { CardHeader, CardBody } from '@/components/ui/Card';

export default function Page() {
  return (
    <main className="container">
      <p className="mb-4">
        <Link href="/questionnaires" className="underline">← Back</Link>
      </p>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">VSME — Section B1</h1>
          <p className="text-[--color-text-muted] mt-1">Operational metrics (demo)</p>
        </div>
        <Button variant="secondary" size="sm" href="/get-report">Generate report</Button>
      </div>

      <Card>
        <CardHeader title="Demo questions" />
        <CardBody>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Metric 1</Label>
              <Input placeholder="e.g., Energy used (kWh)" />
            </div>
            <div>
              <Label>Metric 2</Label>
              <Input placeholder="e.g., Water used (m³)" />
            </div>
            <div className="sm:col-span-2">
              <Label>Notes</Label>
              <Textarea placeholder="Any comments or calculation notes…" />
            </div>
          </div>
          <div className="mt-5 flex gap-3">
            <Button type="button">Save draft</Button>
            <Button type="button" variant="secondary">Save final</Button>
          </div>
        </CardBody>
      </Card>
    </main>
  );
}
