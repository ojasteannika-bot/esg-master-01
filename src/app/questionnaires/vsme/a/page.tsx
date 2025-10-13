export default function VsmeA(){
  return (
    <section className="mx-auto max-w-6xl">
      <header className="mb-6" style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
        <div>
          <h1 style={{fontSize:28,fontWeight:800,letterSpacing:'-0.02em'}}>VSME – Section A</h1>
          <p className="text-[--color-text-muted]" style={{marginTop:4}}>Company basics</p>
        </div>
        <a href="/questionnaires" className="btn">Back</a>
      </header>
      <div className="q-grid">
        <div className="q-card">
          <h3>About the company</h3>
          <div className="q-meta">A1 · 3 questions</div>
          <div style={{marginTop:12,display:'flex',gap:8}}>
            <a href="/esglite/item/A1-1" className="btn">Open</a>
          </div>
        </div>
      </div>
    </section>
  );
}
