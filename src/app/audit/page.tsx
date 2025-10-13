export default async function AuditPage(){
  return (
    <section className="mx-auto max-w-6xl">
      <header className="mb-6" style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
        <div>
          <h1 style={{fontSize:28,fontWeight:800,letterSpacing:'-0.02em'}}>Audit trail</h1>
          <p className="text-[--color-text-muted]" style={{marginTop:4}}>Latest events</p>
        </div>
        <a className="btn" href="/api/cdm/audit.csv?project=client-test1&limit=200" style={{textDecoration:'none'}}>Download CSV</a>
      </header>
      <div className="q-card">
        <p className="q-meta">Coming next: table with events (actor, action, target, ts)</p>
      </div>
    </section>
  );
}
