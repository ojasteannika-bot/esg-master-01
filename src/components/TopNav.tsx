'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

type Item = { href: string; label: string };

const NAV: Item[] = [
  { href: '/',                 label: 'Home' },
  { href: '/questionnaires',   label: 'Questionnaires' },
  { href: '/wizard',           label: 'Wizard' },
  { href: '/preview',          label: 'Preview' },
  { href: '/audit',            label: 'Audit' },
  { href: '/integrations',     label: 'Integrations' },
];

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(href + '/');
}

export default function TopNav() {
  const pathname = usePathname() || '/';

  return (
    <nav className="w-full border-t border-slate-200">
      <ul className="container mx-auto flex flex-wrap gap-4 p-3">
        {NAV.map((it) => {
          const active = isActive(pathname, it.href);
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                className={
                  'text-sm px-2 py-1 rounded hover:bg-slate-100 ' +
                  (active
                    ? 'font-semibold underline underline-offset-4'
                    : 'text-slate-600')
                }
              >
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
