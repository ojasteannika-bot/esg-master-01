// src/components/Nav.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ProjectPicker from '@/components/ProjectPicker';

const cx = (...cls: Array<string | false | null | undefined>) =>
  cls.filter(Boolean).join(' ');

type NavItem = {
  label: string;
  href: string;
  /** Kui true, lisame ?project=<id> külge */
  attachProject?: boolean;
  /** Aktiivsuse määramise reegel; kui puudu, kasutatakse startsWith(href) */
  isActive?: (pathname: string) => boolean;
};

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/', attachProject: false, isActive: (p) => p === '/' },
  { label: 'ESGLITE', href: '/esglite', attachProject: true, isActive: (p) => p.startsWith('/esglite') },
  { label: 'Disclosures', href: '/questionnaires/esglite/nodes', attachProject: true, isActive: (p) => p.startsWith('/questionnaires') },
  { label: 'Wizard', href: '/wizard', attachProject: false, isActive: (p) => p.startsWith('/wizard') },
  { label: 'Preview', href: '/preview', attachProject: false, isActive: (p) => p.startsWith('/preview') },
  { label: 'Audit', href: '/audit', attachProject: true, isActive: (p) => p.startsWith('/audit') },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [project, setProject] = React.useState<string>('client-test1');

  // loeme aktiivse project ID localStoragest (ProjectPicker hoolitseb uuendamise eest)
  React.useEffect(() => {
    try {
      const v = localStorage.getItem('project:id');
      if (v) setProject(v);
    } catch {
      /* ignore */
    }
  }, []);

  // lihtne util linkide koostamiseks
  function withProject(item: NavItem) {
    if (!item.attachProject) return item.href;
    const url = new URL(item.href, 'http://dummy'); // base vaid parsimiseks
    url.searchParams.set('project', project || 'client-test1');
    // eemaldame dummy origin'i
    return url.pathname + (url.search ? url.search : '');
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-3">
        {/* Left: logo/brand */}
        <div className="flex items-center gap-3">
          <Link href="/" className="text-sm font-semibold tracking-tight">
            ESG-MASTER-01
          </Link>
        </div>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-3 text-sm md:flex">
          {NAV_ITEMS.map((item) => {
            const active = item.isActive ? item.isActive(pathname) : pathname.startsWith(item.href);
            return (
              <Link
                key={item.label}
                href={withProject(item)}
                className={cx(
                  'rounded-md px-3 py-1.5 transition-colors',
                  active
                    ? 'bg-black text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Project picker + mobile toggle */}
        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            <ProjectPicker />
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            aria-label="Toggle navigation"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center justify-center rounded-md border border-gray-300 p-2 md:hidden"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="border-t bg-white md:hidden">
          <div className="container mx-auto px-3 py-3">
            <div className="mb-3">
              <ProjectPicker />
            </div>
            <div className="flex flex-col">
              {NAV_ITEMS.map((item) => {
                const active = item.isActive ? item.isActive(pathname) : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.label}
                    href={withProject(item)}
                    onClick={() => setOpen(false)}
                    className={cx(
                      'rounded-md px-3 py-2 text-sm',
                      active ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
