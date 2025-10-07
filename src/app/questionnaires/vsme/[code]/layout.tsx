import type { ReactNode } from 'react';

export default async function VsmeCodeLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ code: string }>;
}) {
  // Next 15: params on Promise – await!
  const { code } = await params;

  // soovi korral kasuta `code` väärtust breadcrumbi/nav jaoks
  return <>{children}</>;
}
