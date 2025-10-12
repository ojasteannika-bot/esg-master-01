// src/app/wizard/page.tsx
'use client';

import { useEffect, useMemo, useState, startTransition } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

type AuditEvent = {
  type: string;
  project: string;
  ctx?: string;
  from?: string;
  to?: string;
  data?: any;
};

async function logAudit(ev: AuditEvent) {
  try {
    await fetch('/api/cdm/audit', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(ev),
      cache: 'no-store',
    });
  } catch {
    // MVP: vaikne ignore, et demot ei katkestaks
  }
}

const PROJECT_FALLBACK = 'client-test1';
type Step = 'A' | 'B' | 'C' | 'DONE';

export default function WizardPage() {
  const spHook = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const project = spHook.get('project') ?? PROJECT_FALLBACK;

  // URL query objekt Link/replace jaoks (typedRoutes sõbralik)
  const queryObj = useMemo(() => {
    const sp = new URLSearchParams(spHook.toString());
    sp.set('project', project);
    return Object.fromEntries(sp.entries());
  }, [spHook, project]);

  const [step, setStep] = useState<Step>('A');

  useEffect(() => {
    logAudit({ type: 'nav', project, ctx: 'wizard', from: 'enter', to: step });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function go(next: Step) {
    const prev = step;
    startTransition(() => {
      setStep(next);
      logAudit({ type: 'nav', project, ctx: 'wizard', from: prev, to: next });
      router.replace({ pathname, query: queryObj }, { scroll: false });
    });
  }

  return (
    <main style={{ maxWidth: 960, margin: '0 auto', padding: 24 }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Wizard</h1>
      <p style={{ marginBottom: 16 }}>
        Project: <code>{project}</code>
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button onClick={() => go('A')}>Step A</button>
        <button onClick={() => go('B')}>Step B</button>
        <button onClick={() => go('C')}>Step C</button>
        <button onClick={() => go('DONE')}>Finish</button>
      </div>

      <section style={{ padding: 16, border: '1px solid #e5e7eb', borderRadius: 8 }}>
        <h2 style={{ fontSize: 20, marginBottom: 12 }}>Step {step}</h2>

        <label style={{ display: 'block', marginBottom: 8 }}>
          Example field:
          <input
            style={{ marginLeft: 8 }}
            onChange={(e) =>
              logAudit({
                type: 'field',
                project,
                ctx: `wizard-${step}`,
                data: { key: 'example', value: e.target.value },
              })
            }
          />
        </label>

        {step !== 'DONE' ? (
          <button onClick={() => go(step === 'A' ? 'B' : step === 'B' ? 'C' : 'DONE')}>
            Next
          </button>
        ) : (
          <div style={{ color: '#16a34a', fontWeight: 600 }}>Done!</div>
        )}
      </section>
    </main>
  );
}
