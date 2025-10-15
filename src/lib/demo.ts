import fs from 'fs/promises';
export async function readB1() {
  try { return JSON.parse(await fs.readFile('.data/esglite/demo/B1.items.json','utf8')); }
  catch { return []; }
}
