import { describe, it, expect } from 'vitest';

const BASE = process.env.APP_BASE_URL || 'http://localhost:3001';

describe('CDM API smoke', () => {
  it('/api/cdm/item?code=B1-1 returns ok', async () => {
    const r = await fetch(`${BASE}/api/cdm/item?project=client-test1&code=B1-1`);
    expect(r.ok).toBe(true);
    const json = await r.json();
    expect(json.ok).toBe(true);
    expect(json.schema?.code).toBe('B1-1');
  });

  it('save draft for B1-2 works', async () => {
    const r = await fetch(`${BASE}/api/cdm/item/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project: 'client-test1',
        code: 'B1-2',
        status: 'draft',
        values: { basis: 'Individual', notes: 'smoke test' },
      }),
    });
    expect(r.ok).toBe(true);
    const json = await r.json();
    expect(json.ok).toBe(true);
    expect(json.status).toBe('draft');
  });

  it('/api/cdm/progress returns totals & sections', async () => {
    const r = await fetch(`${BASE}/api/cdm/progress?project=client-test1`);
    expect(r.ok).toBe(true);
    const json = await r.json();
    expect(json.ok).toBe(true);
    expect(json.totals).toBeDefined();
    expect(json.sections?.B1).toBeDefined();
  });
});
