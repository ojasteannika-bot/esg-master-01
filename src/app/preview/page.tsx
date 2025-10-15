import { redirect } from 'next/navigation';

type SP = { project?: string };

export default async function Page({ searchParams }: { searchParams: Promise<SP> }) {
  const p = (await searchParams).project ?? 'client-XYZ';
  redirect(`/get-report?project=${encodeURIComponent(p)}`);
}
